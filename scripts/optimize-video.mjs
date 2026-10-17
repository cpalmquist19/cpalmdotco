#!/usr/bin/env node
/**
 * Converts MP4 videos into web-optimized, silent, looping-friendly assets.
 *
 * With no arguments it converts every .mp4 in each `raw` folder under public/
 * (for example public/beame/raw) and writes the results to the folder above it
 * (public/beame). Inputs that are already processed are skipped.
 *
 * For each input it writes:
 *   <name>.webm      VP9, smallest file; listed first in <source> lists
 *   <name>-opt.mp4   H.264 with faststart; fallback for Safari and others
 *   <name>-poster.jpg (optional) first frame, for a still placeholder
 * where <name> is the input file name made URL-safe, e.g.
 * "BEAM-E Send Data.mp4" becomes beam-e-send-data.
 *
 * An output counts as processed when it exists and is newer than its input.
 *
 * Requires ffmpeg on PATH. No npm dependencies.
 *
 * Usage:
 *   npm run optimize-video [-- <file.mp4 | folder> ...] [options]
 *
 * Options:
 *   --out <dir>       Output directory (default: the parent of a `raw` folder, else public)
 *   --name <name>     Output base name (default: URL-safe input name; single file only)
 *   --width <px>      Maximum width; never upscales (default: 1280)
 *   --fps <n>         Maximum frame rate (default: 24)
 *   --crf <n>         Quality for H.264, 0-51, lower is better (default: 26)
 *   --webm-crf <n>    Quality for VP9, 0-63, lower is better (default: 34)
 *   --duration <s>    Trim to the first <s> seconds
 *   --poster          Also write a first-frame JPEG
 *   --no-webm         Skip the WebM output
 *   --no-mp4          Skip the MP4 output
 *   --force           Reprocess even if outputs are up to date
 *   -h, --help        Show this help
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

const USAGE = `Usage: npm run optimize-video [-- <file.mp4 | folder> ...] [options]

With no inputs, converts every .mp4 in each \`raw\` folder under public/ and
writes the results to the folder above it. Already processed files are skipped.

Options:
  --out <dir>       Output directory (default: the parent of a \`raw\` folder, else public)
  --name <name>     Output base name (default: URL-safe input name; single file only)
  --width <px>      Maximum width; never upscales (default: 1280)
  --fps <n>         Maximum frame rate (default: 24)
  --crf <n>         Quality for H.264, 0-51, lower is better (default: 26)
  --webm-crf <n>    Quality for VP9, 0-63, lower is better (default: 34)
  --duration <s>    Trim to the first <s> seconds
  --poster          Also write a first-frame JPEG
  --no-webm         Skip the WebM output
  --no-mp4          Skip the MP4 output
  --force           Reprocess even if outputs are up to date
  -h, --help        Show this help`;

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    if (result.error.code === "ENOENT") {
      fail(`${command} not found. Install ffmpeg and make sure it is on PATH.`);
    }
    throw result.error;
  }
  return result;
}

function toNumber(value, flag, { min, max } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || (min !== undefined && n < min) || (max !== undefined && n > max)) {
    fail(`--${flag} must be a number${min !== undefined ? ` between ${min} and ${max}` : ""}`);
  }
  return n;
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: "string" },
    name: { type: "string" },
    width: { type: "string", default: "1280" },
    fps: { type: "string", default: "24" },
    crf: { type: "string", default: "26" },
    "webm-crf": { type: "string", default: "34" },
    duration: { type: "string" },
    poster: { type: "boolean", default: false },
    "no-webm": { type: "boolean", default: false },
    "no-mp4": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(USAGE);
  process.exit(0);
}
if (values["no-webm"] && values["no-mp4"] && !values.poster) fail("nothing to write");

const width = toNumber(values.width, "width", { min: 16, max: 7680 });
const fps = toNumber(values.fps, "fps", { min: 1, max: 120 });
const crf = toNumber(values.crf, "crf", { min: 0, max: 51 });
const webmCrf = toNumber(values["webm-crf"], "webm-crf", { min: 0, max: 63 });
const duration = values.duration ? toNumber(values.duration, "duration", { min: 0.1 }) : null;

if (run("ffmpeg", ["-version"]).status !== 0) fail("ffmpeg could not be run");

const PUBLIC_DIR = resolve("public");

function isMp4(file) {
  return extname(file).toLowerCase() === ".mp4";
}

/** Every `raw` folder under `dir`, searched recursively. */
function findRawDirs(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (entry.name === "raw") found.push(path);
    else found.push(...findRawDirs(path));
  }
  return found;
}

/** Expands files and folders into a list of .mp4 paths, reporting bad inputs. */
function collectInputs(inputs) {
  const files = [];
  for (const input of inputs) {
    const path = resolve(input);
    if (!existsSync(path)) {
      console.error(`error: ${input} does not exist`);
      failed = true;
    } else if (statSync(path).isDirectory()) {
      const found = readdirSync(path).filter(isMp4).sort();
      if (found.length === 0) console.log(`no .mp4 files in ${input}`);
      files.push(...found.map((file) => join(path, file)));
    } else {
      files.push(path);
    }
  }
  return files;
}

/** "BEAM-E Send Data.mp4" -> "beam-e-send-data" */
function slugify(file) {
  const slug = basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "video";
}

/** Files in a `raw` folder go to the folder above it; everything else to public/. */
function outputDir(file) {
  if (values.out) return resolve(values.out);
  const dir = dirname(file);
  return basename(dir) === "raw" ? dirname(dir) : PUBLIC_DIR;
}

// -2 keeps the aspect ratio with an even height, which yuv420p requires.
const filter = `fps=${fps},scale=w='min(${width},iw)':h=-2:flags=lanczos`;

const common = ["-hide_banner", "-loglevel", "error", "-y"];
const trim = duration ? ["-t", String(duration)] : [];

function targets(name) {
  const list = [];
  if (!values["no-webm"]) {
    list.push({
      file: `${name}.webm`,
      args: [
        "-vf", filter,
        "-c:v", "libvpx-vp9",
        "-crf", String(webmCrf),
        "-b:v", "0",
        "-row-mt", "1",
        "-pix_fmt", "yuv420p",
        "-an",
      ],
    });
  }
  if (!values["no-mp4"]) {
    list.push({
      file: `${name}-opt.mp4`,
      args: [
        "-vf", filter,
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", String(crf),
        "-profile:v", "high",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
      ],
    });
  }
  if (values.poster) {
    list.push({
      file: `${name}-poster.jpg`,
      args: ["-vf", filter, "-frames:v", "1", "-q:v", "3"],
      still: true,
    });
  }
  return list;
}

let failed = false;

const inputs =
  positionals.length > 0
    ? collectInputs(positionals)
    : collectInputs(findRawDirs(PUBLIC_DIR));

if (values.name && inputs.length > 1) fail("--name only works with a single input");
if (inputs.length === 0 && !failed) {
  console.log(
    positionals.length > 0
      ? "nothing to convert"
      : "no `raw` folders with .mp4 files found under public/. Pass a file or folder.",
  );
}

let converted = 0;
let skipped = 0;

for (const inputPath of inputs) {
  const name = values.name ?? slugify(inputPath);
  const outDir = outputDir(inputPath);
  const { size: inputSize, mtimeMs: inputTime } = statSync(inputPath);
  console.log(`
${basename(inputPath)} (${formatSize(inputSize)})`);

  for (const target of targets(name)) {
    const outPath = join(outDir, target.file);
    if (!values.force && existsSync(outPath) && statSync(outPath).mtimeMs >= inputTime) {
      console.log(`  skip ${target.file} (already processed)`);
      skipped++;
      continue;
    }
    mkdirSync(outDir, { recursive: true });
    // Trimming applies to the video outputs; a poster is just the first frame.
    const args = [...common, "-i", inputPath, ...(target.still ? [] : trim), ...target.args, outPath];
    const result = run("ffmpeg", args);
    if (result.status !== 0) {
      console.error(`  fail ${target.file}
${result.stderr.trim()}`);
      failed = true;
      continue;
    }
    converted++;
    const size = statSync(outPath).size;
    const note = target.still ? "" : ` (${Math.round((size / inputSize) * 100)}% of original)`;
    console.log(`  wrote ${relative(process.cwd(), outPath)}  ${formatSize(size)}${note}`);
  }
}

console.log(`
${converted} written, ${skipped} skipped${failed ? ", with errors" : ""}`);
process.exit(failed ? 1 : 0);
