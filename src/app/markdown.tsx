import { Fragment, type ReactNode } from "react";

/**
 * Small markdown renderer for chat replies: paragraphs, headings, bullet and
 * numbered lists, fenced code, and **bold**, *italic*, `code` and [links](url).
 * It builds React elements (never raw HTML), so model output can't inject markup,
 * and a half-streamed marker such as an unclosed `**` just shows as plain text.
 */

// One alternative per inline style, tried left to right: `code`, **bold**, *italic*, [text](url)
const INLINE = /`([^`\n]+)`|\*\*([^*\n]+?)\*\*|\*([^*\s][^*\n]*?)\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

const SAFE_URL = /^(https?:\/\/|mailto:)/i;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const [, code, bold, italic, label, url] = match;
    if (code !== undefined) {
      nodes.push(
        <code key={key++} className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-100">
          {code}
        </code>,
      );
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-slate-50">
          {renderInline(bold)}
        </strong>,
      );
    } else if (italic !== undefined) {
      nodes.push(<em key={key++}>{renderInline(italic)}</em>);
    } else if (SAFE_URL.test(url)) {
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(match[0]);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// A paragraph keeps its single line breaks, since models often use them between sentences
function renderLines(lines: string[]): ReactNode[] {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderInline(line)}
    </Fragment>
  ));
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const FENCE = /^\s*```/;

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
    } else if (FENCE.test(line)) {
      // An unterminated fence (still streaming) runs to the end of the text
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key++} className="overflow-x-auto rounded-lg bg-black/30 px-3 py-2 font-mono text-[13px] leading-relaxed text-slate-100">
          {code.join("\n")}
        </pre>,
      );
    } else if (HEADING.test(line)) {
      const [, , title] = line.match(HEADING)!;
      blocks.push(
        <p key={key++} className="font-semibold text-slate-50">
          {renderInline(title)}
        </p>,
      );
      i++;
    } else if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = NUMBERED.test(line);
      const pattern = ordered ? NUMBERED : BULLET;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i])) {
        items.push(lines[i].match(pattern)![1]);
        i++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={key++} className={`space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"} marker:text-slate-400`}>
          {items.map((item, n) => (
            <li key={n}>{renderInline(item)}</li>
          ))}
        </List>,
      );
    } else {
      const para: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !FENCE.test(lines[i]) &&
        !HEADING.test(lines[i]) &&
        !BULLET.test(lines[i]) &&
        !NUMBERED.test(lines[i])
      ) {
        para.push(lines[i++]);
      }
      blocks.push(<p key={key++}>{renderLines(para)}</p>);
    }
  }

  return <div className="space-y-2">{blocks}</div>;
}
