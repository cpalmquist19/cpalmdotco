// Re-takes the responsive screenshot gallery in screenshots/: a full-page capture of the home page at each size
// below, saved as <category>-<width>x<height>-<device>.webp. Needs the site running (npm run dev, or npm run build
// then npm start) and Chromium installed once with: npx playwright install chromium
//
//   npm run screenshots                       all sizes, from http://localhost:3000
//   npm run screenshots -- --only phone       only names that contain "phone" (so "phone-landscape" too)
//   npm run screenshots -- --url http://localhost:3100 --path /experience --out screenshots/experience
//   npm run screenshots -- --headed           show the browser while it works
//   npm run screenshots -- --prune           also delete screenshots that are no longer in the list
//
// Prefer a production server: a dev server compiles each page on its first visit and draws its own indicator.
// The indicator is hidden here, but the first capture can still be slow.

import { chromium } from "@playwright/test";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// A mobile device is a phone or a tablet: it gets touch and the mobile viewport, so the layout matches a real one
const SIZES = [
  { category: "phone", width: 360, height: 740, device: "android-small", mobile: true },
  { category: "phone", width: 375, height: 667, device: "iphone-se", mobile: true },
  { category: "phone", width: 390, height: 844, device: "iphone-14", mobile: true },
  { category: "phone", width: 412, height: 915, device: "pixel-7", mobile: true },
  { category: "phone", width: 430, height: 932, device: "iphone-pro-max", mobile: true },
  { category: "phone-landscape", width: 844, height: 390, device: "iphone-14-landscape", mobile: true },
  { category: "phone-landscape", width: 932, height: 430, device: "iphone-pro-max-landscape", mobile: true },
  { category: "tablet", width: 768, height: 1024, device: "ipad-mini-portrait", mobile: true },
  { category: "tablet", width: 820, height: 1180, device: "ipad-air-portrait", mobile: true },
  { category: "tablet", width: 1024, height: 1366, device: "ipad-pro-portrait", mobile: true },
  { category: "tablet-landscape", width: 1024, height: 768, device: "ipad-landscape", mobile: true },
  { category: "tablet-landscape", width: 1180, height: 820, device: "ipad-air-landscape", mobile: true },
  { category: "laptop", width: 1279, height: 800, device: "just-below-desktop-breakpoint" },
  { category: "laptop", width: 1280, height: 720, device: "small-laptop" },
  { category: "laptop", width: 1366, height: 768, device: "common-laptop" },
  { category: "laptop", width: 1440, height: 900, device: "macbook-air" },
  { category: "laptop", width: 1536, height: 864, device: "windows-laptop-125pct" },
  { category: "laptop", width: 1600, height: 900, device: "laptop-hd-plus" },
  { category: "desktop", width: 1920, height: 1080, device: "full-hd" },
  { category: "desktop", width: 1920, height: 1200, device: "wuxga" },
  { category: "desktop", width: 2560, height: 1440, device: "qhd" },
  { category: "desktop", width: 3440, height: 1440, device: "ultrawide" },
];

const WEBP_QUALITY = 85;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readArgs(argv) {
  const args = { url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`, path: "/", out: "screenshots", only: "", prune: false, headed: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--prune") args.prune = true;
    else if (flag === "--headed") args.headed = true;
    else if (["--url", "--path", "--out", "--only"].includes(flag)) {
      const value = argv[++i];
      if (value === undefined) throw new Error(`${flag} needs a value`);
      args[flag.slice(2)] = value;
    } else throw new Error(`Unknown argument: ${flag}`);
  }
  return args;
}

const fileName = (size) => `${size.category}-${size.width}x${size.height}-${size.device}.webp`;

/** Scrolls to the bottom and back so lazy images load, then waits for every visible image and the web fonts */
async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    // Not img.decode(): it crashed the page in headless Chromium. A lazy image inside a display: none parent (like
    // the chat header's avatar on small screens) never loads, so only rendered images count, and none waits past 5s.
    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete && img.getClientRects().length)
        .map((img) => new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 5000);
        })),
    );
  });
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  const target = new URL(args.path, args.url).href;
  const outDir = path.resolve(root, args.out);
  const sizes = SIZES.filter((size) => fileName(size).includes(args.only));
  if (!sizes.length) throw new Error(`No size matches --only "${args.only}"`);

  const response = await fetch(target).catch(() => null);
  if (!response?.ok) {
    throw new Error(`Cannot reach ${target}${response ? ` (status ${response.status})` : ""}. Start the site first: npm run build && npm start`);
  }

  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: !args.headed });
  try {
    for (const size of sizes) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        deviceScaleFactor: 1,
        isMobile: !!size.mobile,
        hasTouch: !!size.mobile,
      });
      const page = await context.newPage();
      page.on("crash", () => console.error(`The page crashed at ${size.width}x${size.height}`));
      await page.goto(target, { waitUntil: "networkidle" });
      // Screenshots should show the site, not the Next.js dev indicator
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      await settle(page);

      const png = await page.screenshot({ fullPage: true, animations: "disabled" });
      const file = path.join(outDir, fileName(size));
      const info = await sharp(png).webp({ quality: WEBP_QUALITY }).toFile(file);
      console.log(`${fileName(size)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (args.prune && !args.only) {
    const keep = new Set(SIZES.map(fileName));
    for (const name of await readdir(outDir)) {
      if (name.endsWith(".webp") && !keep.has(name)) {
        await rm(path.join(outDir, name));
        console.log(`removed ${name}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
