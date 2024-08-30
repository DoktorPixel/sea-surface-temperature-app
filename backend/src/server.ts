import express, { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import multer from "multer";

const app = express();
const port = 3001;

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
      console.error("File upload failed");
      return res.status(400).send("Error: File not uploaded");
    }
    console.log("File uploaded successfully:", req.file);

    try {
      const zip = new JSZip();
      const data = fs.readFileSync(req.file.path);
      const content = await zip.loadAsync(data);
      const binaryData = await content.file("sst.grid")?.async("nodebuffer");

      if (!binaryData) {
        return res
          .status(400)
          .send("Error: Invalid file or sst.grid file is missing.");
      }

      const mapPath = path.join(__dirname, "../public/empty-map-rotate.jpg");
      const mapImage = await loadImage(mapPath);

      const SCALE = 0.1; // 10%
      const canvas = createCanvas(
        BINARY_DIMENSION_X * SCALE,
        BINARY_DIMENSION_Y * SCALE
      );
      const ctx = canvas.getContext("2d");

      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      ctx.drawImage(
        mapImage,
        0,
        0,
        mapImage.width,
        mapImage.height,
        0,
        0,
        BINARY_DIMENSION_X * SCALE,
        BINARY_DIMENSION_Y * SCALE
      );

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dataBuffer = imageData.data;

      const scaledWidth = Math.floor(BINARY_DIMENSION_X * SCALE);
      const scaledHeight = Math.floor(BINARY_DIMENSION_Y * SCALE);

      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          const originalX = Math.floor(x / SCALE);
          const originalY = Math.floor(y / SCALE);

          const index = originalY * BINARY_DIMENSION_X + originalX;
          const temp = binaryData[index];

          if (temp === 255) continue;

          const color = getColorForTemperature(temp);
          const pixelIndex = (y * canvas.width + x) * 4;

          dataBuffer[pixelIndex] = color.r;
          dataBuffer[pixelIndex + 1] = color.g;
          dataBuffer[pixelIndex + 2] = color.b;
          dataBuffer[pixelIndex + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const outputPath = path.join(__dirname, "../public", "output.png");
      const buffer = canvas.toBuffer("image/png");

      fs.writeFileSync(outputPath, buffer);

      fs.unlinkSync(req.file.path);

      res.json({ message: "Map generated", imageUrl: "/output.png" });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).send("Error processing file");
    }
  }
);

function interpolateColor(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number
): { r: number; g: number; b: number } {
  const result = {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor),
  };
  return result;
}

function getColorForTemperature(temp: number): {
  r: number;
  g: number;
  b: number;
} {
  if (temp === 255) {
    return { r: 0, g: 0, b: 0 };
  }

  const tempRanges = [
    {
      min: 0,
      max: 30,
      startColor: { r: 0, g: 0, b: 139 },
      endColor: { r: 0, g: 0, b: 255 },
    },
    {
      min: 30,
      max: 40,
      startColor: { r: 0, g: 0, b: 255 },
      endColor: { r: 173, g: 216, b: 230 },
    },
    {
      min: 40,
      max: 50,
      startColor: { r: 173, g: 216, b: 230 },
      endColor: { r: 0, g: 255, b: 0 },
    },
    {
      min: 50,
      max: 60,
      startColor: { r: 0, g: 255, b: 0 },
      endColor: { r: 173, g: 255, b: 47 },
    },
    {
      min: 60,
      max: 70,
      startColor: { r: 173, g: 255, b: 47 },
      endColor: { r: 255, g: 255, b: 0 },
    },
    {
      min: 70,
      max: 80,
      startColor: { r: 255, g: 255, b: 0 },
      endColor: { r: 255, g: 165, b: 0 },
    },
    {
      min: 80,
      max: 90,
      startColor: { r: 255, g: 165, b: 0 },
      endColor: { r: 255, g: 0, b: 0 },
    },
    {
      min: 90,
      max: 100,
      startColor: { r: 255, g: 0, b: 0 },
      endColor: { r: 255, g: 0, b: 0 },
    },
  ];

  for (const range of tempRanges) {
    if (temp >= range.min && temp < range.max) {
      const rangeSpan = range.max - range.min;
      const normalizedTemp = (temp - range.min) / rangeSpan;
      return interpolateColor(range.startColor, range.endColor, normalizedTemp);
    }
  }

  if (temp >= 100) return { r: 255, g: 0, b: 0 }; // red
  if (temp < 0) return { r: 0, g: 0, b: 139 }; // darkblue
  return { r: 0, g: 0, b: 0 };
}

app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});

export default app;
