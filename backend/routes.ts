// routes.ts
import express, { Request, Response } from "express";
import fs from "fs";
import JSZip from "jszip";
import { UploadedFile } from "express-fileupload";

const router = express.Router();

router.post("/upload", async (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("File not uploaded");
  }

  const uploadedFile = req.files.file as UploadedFile;

  if (uploadedFile.mimetype !== "application/zip") {
    return res.status(400).send("Incorrect file format");
  }

  const zip = new JSZip();
  const data = await zip.loadAsync(uploadedFile.data);

  let imageBuffer = null;
  data.forEach((relativePath, file) => {
    if (relativePath.endsWith(".png")) {
      imageBuffer = file.async("nodebuffer");
    }
  });

  if (!imageBuffer) {
    return res.status(400).send("Could not find image in archive");
  }

  const outputPath = `${__dirname}/static/output.png`;
  fs.writeFileSync(outputPath, await imageBuffer);

  res.json({ imageUrl: "/output.png" });
});

export default router;
