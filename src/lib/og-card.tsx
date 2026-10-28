import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The preview card shown when a link to the site is shared: text on the left, a picture on the right. The home page and
// each project page use it, so they look like one family. It is drawn once at build time, in the same typeface as the site

const weights = [400, 600, 700] as const;

const readFont = (weight: number) =>
  readFile(join(process.cwd(), "node_modules/@fontsource/geist-sans/files", `geist-sans-latin-${weight}-normal.woff`));

async function readPicture(file: string) {
  const bytes = await readFile(join(process.cwd(), "public", file));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

type Card = {
  eyebrow: string;
  title: string;
  subtitle: string;
  // A file in public/, and its width over its height
  picture: { file: string; aspect: number };
};

export async function ogCard({ eyebrow, title, subtitle, picture }: Card) {
  const [src, ...fonts] = await Promise.all([readPicture(picture.file), ...weights.map(readFont)]);
  const pictureHeight = 500;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          gap: 56,
          color: "#ffffff",
          fontFamily: "Geist",
          background: "#070b1a",
          backgroundImage: "radial-gradient(circle at 80% 45%, rgba(59,130,246,0.34), rgba(7,11,26,0) 62%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 6, textTransform: "uppercase", color: "#9cc3ff" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: title.length > 12 ? 72 : 96, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
              {title}
            </div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 32, fontWeight: 400, lineHeight: 1.35, color: "#b6c2d8" }}>
              {subtitle}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#f5a25d" }}>www.cpalm.dev</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn by the image renderer, not shown in a page */}
        <img
          src={src}
          alt=""
          width={Math.round(pictureHeight * picture.aspect)}
          height={pictureHeight}
          style={{ alignSelf: "center", borderRadius: 32, objectFit: "cover", border: "2px solid rgba(255,255,255,0.12)" }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.map((data, i) => ({ name: "Geist", data, weight: weights[i], style: "normal" as const })),
    },
  );
}
