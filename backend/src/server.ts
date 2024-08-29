// backend/src/server.ts
import express, { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import multer from "multer";

const app = express();
const port = 3001;

//  multer
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const BINARY_DIMENSION_X = 36000;
const BINARY_DIMENSION_Y = 17999;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the Sea Surface Temperature App!");
});

app.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send("Error: File not uploaded");
    }

    //  ZIP
    const zip = new JSZip();
    const data = fs.readFileSync(req.file.path);
    const content = await zip.loadAsync(data);
    const binaryData = await content.file("sst.grid")?.async("nodebuffer");

    if (!binaryData) {
      return res
        .status(400)
        .send("Error: Invalid file or sst.grid file is missing.");
    }

    if (binaryData) {
      console.log(binaryData.slice(0, 100));
    }

    // empty-map
    const mapPath = path.join(__dirname, "../public/empty-map.jpg");
    const mapImage = await loadImage(mapPath);

    // createCanvas
    const SCALE = 0.1; // 10%
    const canvas = createCanvas(
      BINARY_DIMENSION_X * SCALE,
      BINARY_DIMENSION_Y * SCALE
    );
    const ctx = canvas.getContext("2d");
    // ctx.drawImage(
    //   mapImage,
    //   0,
    //   0,
    //   mapImage.width,
    //   mapImage.height,
    //   0,
    //   0,
    //   BINARY_DIMENSION_X * SCALE,
    //   BINARY_DIMENSION_Y * SCALE
    // );

    ctx.drawImage(mapImage, 0, 0, BINARY_DIMENSION_X, BINARY_DIMENSION_Y);

    // Processing temperature data
    for (let y = 0; y < BINARY_DIMENSION_Y; y++) {
      for (let x = 0; x < BINARY_DIMENSION_X; x++) {
        const index = y * BINARY_DIMENSION_X + x;
        const temp = binaryData[index];
        console.log(temp);
        const color = getColorForTemperature(temp);

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Save the image
    const outputPath = path.join(__dirname, "../public", "output.png");
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    res.json({ message: "Map generated", imageUrl: "/output.png" });
  }
);

function getColorForTemperature(temp: number): string {
  if (temp < 50) return "blue";
  if (temp < 70) return "green";
  if (temp < 90) return "yellow";
  return "red";
}

app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});
export default app;
