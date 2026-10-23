import express from "express";
import path from "path";
import app from "./api/index.js";

const PORT = 3000;

async function startServer() {
  // Set Cache-Control for static assets & images so the browser caches them and avoids repeated downloads
  app.use((req, res, next) => {
    if (/\.(jpg|jpeg|png|webp|gif|svg|ico|avif|mp4|webm|woff2?)$/i.test(req.path)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
    next();
  });

  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), "public"), {
    maxAge: "365d",
    immutable: true
  }));

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "30d",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware to catch 416 Range Not Satisfiable and other static stream errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.status === 416 || err.name === "RangeNotSatisfiableError")) {
      res.status(416).setHeader("Content-Range", "bytes */*").end();
      return;
    }
    console.error("[Server Error]", err);
    if (!res.headersSent) {
      res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
