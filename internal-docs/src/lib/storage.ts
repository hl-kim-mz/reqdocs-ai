import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_DIR = path.resolve(process.env.LOCAL_STORAGE_DIR ?? "./storage");

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function writeDoc(buffer: Buffer, ext: "md" | "html"): Promise<string> {
  await ensureDir(STORAGE_DIR);
  const id = crypto.randomBytes(16).toString("hex");
  const rel = path.join("docs", `${id}.${ext}`);
  const abs = path.join(STORAGE_DIR, rel);
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, buffer);
  return rel;
}

export async function readDoc(relPath: string): Promise<Buffer> {
  const abs = path.join(STORAGE_DIR, relPath);
  return fs.readFile(abs);
}

export async function deleteDoc(relPath: string): Promise<void> {
  const abs = path.join(STORAGE_DIR, relPath);
  await fs.unlink(abs).catch(() => undefined);
}
