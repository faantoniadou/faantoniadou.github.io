// Adapted from Aceternity's Liquid Glass: displacement map + SVG filter.

function sdRoundedBox(px: number, py: number, hw: number, hh: number, r: number) {
  const qx = Math.abs(px) - hw + r;
  const qy = Math.abs(py) - hh + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

// how much light bends at a given depth from the rim (0 = rim, 1 = centre)
function bend(x: number) {
  const u = 1 - Math.min(1, Math.max(0, x));
  const denom = (1 - u ** 4) ** 0.75;
  if (denom < 1e-6) return 0;
  const thetaI = Math.atan(Math.min(u ** 3 / denom, 8));
  const sinT = Math.sin(thetaI) / 1.5;
  if (sinT >= 1) return Math.sin(thetaI);
  return Math.sin(thetaI - Math.asin(sinT));
}

type MapOptions = { width: number; height: number; radius: number; bevelDepth: number; dpr: number };

export async function makeDisplacementUrl(o: MapOptions): Promise<string> {
  const W = Math.max(1, Math.round(o.width * o.dpr));
  const H = Math.max(1, Math.round(o.height * o.dpr));
  const hw = W / 2;
  const hh = H / 2;
  const r = Math.min(o.radius * o.dpr, hw, hh);
  const bevel = Math.max(1, o.bevelDepth * o.dpr);
  const gain = 1.35;

  // cumulative bend by distance from the rim
  const n = Math.ceil(bevel);
  const phi = new Float32Array(n + 1);
  for (let d = 1; d <= n; d++) phi[d] = phi[d - 1] + bend(d / n);
  const samplePhi = (depth: number) => {
    if (depth <= 0) return 0;
    if (depth >= n) return phi[n];
    const i = Math.floor(depth);
    return phi[i] * (1 - (depth - i)) + phi[i + 1] * (depth - i);
  };

  const field = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = sdRoundedBox(x - hw + 0.5, y - hh + 0.5, hw, hh, r);
      field[y * W + x] = d > 0 ? 0 : samplePhi(Math.min(bevel, -d));
    }
  }

  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const d = sdRoundedBox(x - hw + 0.5, y - hh + 0.5, hw, hh, r);
      if (d > 0) {
        data[i] = data[i + 1] = data[i + 2] = 128; // neutral = no displacement
        data[i + 3] = 0;
        continue;
      }
      const x0 = Math.max(0, x - 1), x1 = Math.min(W - 1, x + 1);
      const y0 = Math.max(0, y - 1), y1 = Math.min(H - 1, y + 1);
      const dx = Math.max(-1, Math.min(1, ((field[y * W + x1] - field[y * W + x0]) / (x1 - x0 || 1)) * gain));
      const dy = Math.max(-1, Math.min(1, ((field[y1 * W + x] - field[y0 * W + x]) / (y1 - y0 || 1)) * gain));
      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.getContext("2d")!.putImageData(new ImageData(data, W, H), 0, 0);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("Could not encode displacement map");
  return URL.createObjectURL(blob);
}

type FilterOptions = {
  id: string; mapUrl: string; width: number; height: number;
  scale: number; aberration: number; frost: number;
};

export function buildFilterSvg({ id, mapUrl, width, height, scale, aberration, frost }: FilterOptions) {
  const pad = Math.ceil(scale + aberration + 4);
  const px = ((pad / Math.max(1, width)) * 100).toFixed(3);
  const py = ((pad / Math.max(1, height)) * 100).toFixed(3);
  const region = `x="-${px}%" y="-${py}%" width="${(100 + 2 * +px).toFixed(3)}%" height="${(100 + 2 * +py).toFixed(3)}%"`;

  const map = `<feImage href="${mapUrl}" x="0" y="0" width="${width}" height="${height}" result="map" preserveAspectRatio="none"/>`;
  const displace = (s: number, out: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="${out}"/>`;
  const channel = (src: string, values: string, out: string) =>
    `<feColorMatrix in="${src}" type="matrix" values="${values}" result="${out}"/>`;

  const body =
    aberration <= 0
      ? displace(scale, "rgb")
      : `${displace(scale + aberration, "dr")}
  ${channel("dr", "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "red")}
  ${displace(scale, "dg")}
  ${channel("dg", "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "green")}
  ${displace(Math.max(0, scale - aberration), "db")}
  ${channel("db", "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0", "blue")}
  <feBlend in="red" in2="green" mode="screen" result="rg"/>
  <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><filter id="${id}" color-interpolation-filters="sRGB" ${region}>
  ${map}
  ${body}
  <feGaussianBlur in="rgb" stdDeviation="${frost}"/>
</filter></svg>`;
}