import { Router, type Request, type Response } from "express";
import archiver from "archiver";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, "../../../..");

const EXCLUDED_GLOBS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/build/**",
  "**/dist/**",
  "**/.cache/**",
  "**/.env",
  "**/.env.*",
  "**/.local/**",
];

router.get("/download", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="partynest.zip"');

  const archive = archiver("zip", { zlib: { level: 6 } });

  archive.on("error", (err) => {
    console.error("Archive error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to create archive" });
    }
  });

  archive.pipe(res);

  archive.glob("**/*", {
    cwd: WORKSPACE_ROOT,
    ignore: EXCLUDED_GLOBS,
    dot: true,
  });

  archive.finalize();
});

export default router;
