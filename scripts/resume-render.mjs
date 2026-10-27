// Turns the resume source (a Markdown-style text file kept in the resume repo) into what this site ships: the
// redacted public copy of the source, the plain-text download, the HTML that becomes the PDF, and the structured
// data behind the Experience and Skills pages. Pure functions with no file access, so the sync script and its
// --check mode share them.

// Personal details that must never reach the published site, the downloads, or the chat model's prompt
const PHONE = /\+?\d{1,2}[-. ]\d{3}[-. ]\d{3}[-. ]\d{4}/;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const isPii = (text) => PHONE.test(text) || EMAIL.test(text);

const sourceLines = (md) => md.replace(/\r/g, "").split("\n").map((line) => line.replace(/\s+$/, ""));

/**
 * The source with the phone number and email taken out. Every public output is made from this copy, never from the
 * original. The header keeps its line count, because the resume repo's build.js reads the header by line number:
 * the location and the contact line are re-split so the two lines that remain still read "Indian Trail, NC | Remote".
 * Returns the redacted source and the pieces that were removed, so the outputs can be checked for them afterwards.
 */
export function redactSource(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const bodyStart = lines.findIndex((line) => line.startsWith("## "));
  const headerRows = lines.slice(0, bodyStart).flatMap((line, i) => (line.trim() ? [i] : []));
  if (headerRows.length !== 5) {
    throw new Error(`Expected 5 header lines (name, location, contact, links, headline) but found ${headerRows.length}`);
  }
  const [, locationRow, contactRow] = headerRows;

  const parts = [...lines[locationRow].split("|"), ...lines[contactRow].split("|")].map((part) => part.trim()).filter(Boolean);
  const removed = parts.filter(isPii);
  const kept = parts.filter((part) => !isPii(part));
  if (kept.length < 2) {
    throw new Error("After removing the phone and email, fewer than two contact details are left, which build.js cannot lay out");
  }
  lines[locationRow] = kept[0];
  lines[contactRow] = kept.slice(1).join(" | ");

  const redacted = lines.join("\n");
  // Anywhere else in the source counts too
  assertNoPii(redacted, "the redacted source");
  return { text: redacted, removed };
}

/** Throws if the text still holds a phone number, an email, or any piece that redactSource removed */
export function assertNoPii(text, label, removed = []) {
  const leaked = isPii(text) ? "a phone number or email" : removed.find((piece) => text.includes(piece));
  if (leaked) throw new Error(`Personal details leaked into ${label}: ${leaked}`);
}

/** "https://www.cpalm.dev/" becomes "cpalm.dev" */
const displayUrl = (url) => url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

/** The source with its Markdown marks removed, for the .txt download. Links become bare addresses */
export function toPlainText(md) {
  const out = [];
  for (const raw of sourceLines(md)) {
    const line = raw
      .replace(/^#{1,3}\s+/, "")
      .replace(/\[[^\]]+\]\(([^)]+)\)/g, (_, url) => displayUrl(url))
      .replace(/\*\*/g, "")
      .replace(/`/g, "");
    if (line === "" && out[out.length - 1] === "") continue;
    out.push(line);
  }
  while (out[0] === "") out.shift();
  while (out[out.length - 1] === "") out.pop();
  return `${out.join("\n")}\n`;
}

const plainInline = (s) => s.replace(/\*\*/g, "").replace(/`/g, "");

/** Splits a skills line on commas, but not the ones inside parentheses */
function splitItems(text) {
  const items = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === "," && depth === 0) {
      items.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  items.push(current.trim());
  return items.filter(Boolean);
}

/**
 * The resume as data, for the Experience and Skills pages. Reads the same structure build.js does: sections start
 * with "## ", projects and roles with "### " followed by a bold line, and bullets begin with "- ".
 */
export function parseResume(md) {
  const lines = sourceLines(md);
  const sections = new Map();
  let current = null;
  for (const line of lines) {
    if (line.startsWith("## ")) sections.set((current = line.slice(3)), []);
    else if (current && line) sections.get(current).push(line);
  }
  const section = (name) => {
    const found = sections.get(name);
    if (!found?.length) throw new Error(`The resume has no "${name}" section`);
    return found;
  };

  // A list of "### Title", a bold line under it, then bullets
  const blocks = (body) => {
    const out = [];
    for (const line of body) {
      if (line.startsWith("### ")) out.push({ title: plainInline(line.slice(4)), meta: "", highlights: [] });
      else if (line.startsWith("- ")) out.at(-1).highlights.push(plainInline(line.slice(2)));
      else if (out.length && !out.at(-1).meta) out.at(-1).meta = plainInline(line);
    }
    return out;
  };

  const summary = section("PROFESSIONAL SUMMARY").map(plainInline).join(" ");

  const skills = section("TECHNICAL SKILLS").map((line) => {
    const match = line.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
    if (!match) throw new Error(`Could not read this skills line: ${line}`);
    return { group: match[1], items: splitItems(plainInline(match[2])) };
  });

  const projects = blocks(section("SELECTED AI & EVALUATION PROJECTS")).map(({ title, meta, highlights }) => ({ title, meta, highlights }));

  // The first heading is the company ("eRSP (formerly Kaleida Systems)", then "description | dates"), the rest are roles
  const [company, ...roleBlocks] = blocks(section("PROFESSIONAL EXPERIENCE"));
  const [description, period] = company.meta.split(/ \| (.+)/);
  const [, name, former] = company.title.match(/^(.*?)(?:\s*\((.+)\))?$/);
  const employer = {
    name,
    about: [former && former[0].toUpperCase() + former.slice(1), description].filter(Boolean).join(" · "),
    period,
  };
  const roles = roleBlocks.map(({ title, meta, highlights }) => ({ title, period: meta, highlights }));

  if (!summary || !skills.length || !projects.length || !roles.length || !period) {
    throw new Error("The resume is missing a summary, skills, projects, or roles");
  }
  return { summary, skills, projects, employer, roles };
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => escapeHtml(s.replace(/`/g, "")).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const anchor = (url, text = displayUrl(url)) => `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;

// Project headings that get a GitHub link under them. The same map is in build.js, which builds the .docx
const REPOS = { Relay: "relay", Portfolio: "cpalmdotco" };

// Sizes and spacing follow build.js so the PDF and the .docx look alike (it measures in twips: 20 to the point)
const STYLE = `
  body { margin: 0; font: 10.5pt/1.2 Calibri, Carlito, "Segoe UI", Arial, sans-serif; color: #000; }
  p { margin: 0; }
  a { color: #0563C1; text-decoration: underline; }
  h1 { margin: 0; text-align: center; font-size: 18pt; line-height: 1.2; color: #1F3864; }
  .center { text-align: center; }
  .headline { font-weight: bold; color: #1F3864; }
  h2 { margin: 6pt 0 2.5pt; padding-bottom: 0.5pt; font-size: 11pt; color: #1F3864; border-bottom: 0.75pt solid #1F3864; break-after: avoid; }
  .row { display: flex; justify-content: space-between; gap: 12pt; break-after: avoid; }
  .project { margin-top: 1.5pt; break-after: avoid; }
  .company { margin-top: 1.5pt; }
  .role { margin-top: 2.5pt; }
  .desc { margin-bottom: 1pt; font-style: italic; break-after: avoid; }
  .repo { margin-bottom: 0.5pt; break-after: avoid; }
  .skill { margin-bottom: 1.25pt; }
  ul { margin: 0; padding: 0; list-style: none; }
  li { position: relative; padding-left: 18pt; margin-bottom: 1pt; break-inside: avoid; }
  li::before { content: "\\2022"; position: absolute; left: 7pt; }
`;

/** A print-ready page for the PDF, laid out like the .docx that build.js makes from the same source */
export function toHtml(md) {
  const lines = sourceLines(md);
  const bodyStart = lines.findIndex((line) => line.startsWith("## "));
  const header = lines.slice(0, bodyStart).filter(Boolean);
  if (header.length !== 5) {
    throw new Error(`Expected 5 header lines (name, location, contact, links, headline) but found ${header.length}`);
  }
  const [nameLine, location, contact, linkLine, headline] = header;
  const links = [...linkLine.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => anchor(m[2]));

  const html = [
    `<h1>${escapeHtml(nameLine.replace(/^#\s*/, ""))}</h1>`,
    `<p class="center">${escapeHtml(`${location} | ${contact}`)}</p>`,
    `<p class="center">${links.join(" | ")}</p>`,
    `<p class="center headline">${escapeHtml(headline.replace(/\*\*/g, ""))}</p>`,
  ];
  const row = (kind, left, right) => `<div class="row ${kind}"><span><b>${escapeHtml(left)}</b></span><i>${escapeHtml(right)}</i></div>`;

  let inExperience = false;
  let inList = false;
  const closeList = () => {
    if (inList) html.push("</ul>");
    inList = false;
  };

  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (!line.startsWith("- ")) closeList();

    if (line.startsWith("## ")) {
      const title = line.slice(3);
      inExperience = title === "PROFESSIONAL EXPERIENCE";
      html.push(`<h2>${escapeHtml(title)}</h2>`);
    } else if (line.startsWith("### ")) {
      const title = line.slice(4).replace(/`/g, "");
      const meta = (lines[++i] || "").trim();
      if (!inExperience) {
        // A project: the line under the heading lists its technologies
        html.push(`<div class="project"><b>${escapeHtml(title)}</b> | <i>${escapeHtml(meta.replace(/\*\*/g, ""))}</i></div>`);
        const repo = REPOS[title.split(/[ :]/)[0]];
        if (repo) html.push(`<div class="repo">${anchor(`https://github.com/cpalmquist19/${repo}`)}</div>`);
      } else {
        // The company line reads "description | dates", a role line is only its dates
        const body = meta.match(/^\*\*(.+)\*\*$/)?.[1] ?? "";
        if (body.includes(" | ")) {
          const [desc, dates] = body.split(/ \| (.+)/);
          html.push(row("company", title, dates), `<div class="desc">${escapeHtml(desc)}</div>`);
        } else {
          html.push(row("role", title, body));
        }
      }
    } else if (line.startsWith("- ")) {
      if (!inList) html.push("<ul>");
      inList = true;
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line === "**High School Diploma**") {
      html.push(`<p><b>High School Diploma</b> — ${escapeHtml(lines[++i].trim())}</p>`);
    } else {
      const isSkill = /^\*\*[^*]+:\*\*/.test(line) && !line.startsWith("**Selected");
      html.push(`<p${isSkill ? ' class="skill"' : ""}>${inline(line)}</p>`);
    }
  }
  closeList();

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(nameLine.replace(/^#\s*/, ""))} – Resume</title><style>${STYLE}</style></head><body>${html.join("\n")}</body></html>`;
}
