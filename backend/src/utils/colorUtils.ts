interface Color {
  r: number;
  g: number;
  b: number;
}

export const interpolateColor = (
  color1: Color,
  color2: Color,
  factor: number
): Color => {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor),
  };
};

export const getColorForTemperature = (temp: number): Color => {
  if (temp === 255) return { r: 0, g: 0, b: 0 };

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
      const normalizedTemp = (temp - range.min) / (range.max - range.min);
      return interpolateColor(range.startColor, range.endColor, normalizedTemp);
    }
  }
  if (temp >= 100) return { r: 255, g: 0, b: 0 }; // red
  if (temp < 0) return { r: 0, g: 0, b: 139 }; // darkblue
  return { r: 0, g: 0, b: 0 };
};
