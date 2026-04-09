/**
 * Interview Prep Home (9134623041445395180): fetch five screens via @google/stitch-sdk,
 * then download screenshot + HTML URLs with curl -fL (curl.exe on Windows).
 *
 * Requires STITCH_API_KEY in the environment or repo-root .env.
 *
 * Run: npm run fetch-stitch
 */
import { readFileSync, existsSync } from "node:fs";
import { mkdir, readFile, rename, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { stitch } from "@google/stitch-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outBase = join(root, "design", "stitch", "9134623041445395180");
const PROJECT_ID = "9134623041445395180";

/** Screens: Interview Prep Home */
const SCREEN_IDS = [
  "189c6cdd80a146679b88f9f7bcdfdd2d",
  "e646dc2a70bf48bd87e24c06b693d5be",
  "e3bfc5fcbcc54455b7fea9726345b037",
  "1ff8705fe2e8449cb82c7bcfac94da2c",
  "f76e7a564aed4fdb99a3dbb4a5f15182",
];

function loadDotEnv() {
  const p = join(root, ".env");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function toSlug(title) {
  const s = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "screen";
}

function extFromMime(ct) {
  if (!ct) return null;
  if (ct.includes("image/png")) return ".png";
  if (ct.includes("image/jpeg") || ct.includes("image/jpg")) return ".jpg";
  if (ct.includes("text/html")) return ".html";
  if (ct.includes("application/zip")) return ".zip";
  return null;
}

/** Last Content-Type across redirects (curl -D dumps all responses). */
function parseLastContentType(headerDump) {
  let last = "";
  for (const line of headerDump.split(/\r?\n/)) {
    const m = /^content-type:\s*(.+)$/i.exec(line.trim());
    if (m) last = m[1].split(";")[0].trim();
  }
  return last;
}

function curlBin() {
  return process.platform === "win32" ? "curl.exe" : "curl";
}

function runCurl(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(curlBin(), args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${curlBin()} exited with code ${code}`));
    });
  });
}

/**
 * Download URL with curl -fL; rename output using Content-Type from -D dump.
 */
async function curlDownload(url, dir, baseName, defaultExt) {
  const tmpOut = join(dir, `.${baseName}.part`);
  const tmpHdr = join(dir, `.${baseName}.headers`);
  await runCurl(["-f", "-L", "-D", tmpHdr, "-o", tmpOut, url]);
  const hdr = await readFile(tmpHdr, "utf8");
  await unlink(tmpHdr);
  const ct = parseLastContentType(hdr);
  const ext = extFromMime(ct) ?? defaultExt;
  const finalPath = join(dir, `${baseName}${ext}`);
  try {
    await unlink(finalPath);
  } catch {
    /* none */
  }
  await rename(tmpOut, finalPath);
}

async function main() {
  loadDotEnv();
  if (!process.env.STITCH_API_KEY?.trim()) {
    console.error(
      "Missing STITCH_API_KEY. Set it in the environment or in .env at the repo root.",
    );
    process.exit(1);
  }

  const project = stitch.project(PROJECT_ID);
  const usedSlugs = new Set();

  for (const screenId of SCREEN_IDS) {
    const screen = await project.getScreen(screenId);
    const title = screen.data?.title ?? screenId;
    let slug = toSlug(title);
    if (usedSlugs.has(slug)) slug = `${slug}-${screenId.slice(0, 8)}`;
    usedSlugs.add(slug);

    const dir = join(outBase, slug);
    await mkdir(dir, { recursive: true });

    const imageUrl = await screen.getImage();
    const htmlUrl = await screen.getHtml();
    if (!imageUrl || !htmlUrl) {
      throw new Error(`Missing download URL for ${screenId} (${title})`);
    }

    await curlDownload(imageUrl, dir, "screenshot", ".png");
    await curlDownload(htmlUrl, dir, "code", ".html");

    console.log(`OK ${slug} (${title})`);
  }

  console.log(`Done. Output: ${outBase}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
