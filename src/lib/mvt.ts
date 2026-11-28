/**
 * A tiny reader for Mapbox Vector Tiles (the protobuf format OpenFreeMap serves). Only what the area maps need:
 * each layer's features with their type, properties and geometry in tile coordinates.
 * Spec: https://github.com/mapbox/vector-tile-spec/tree/master/2.1
 */
export type Pt = { x: number; y: number };
export type MvtFeature = { type: number; props: Record<string, string | number | boolean>; geom: Pt[][] };
export type MvtLayer = { name: string; extent: number; features: MvtFeature[] };

class Reader {
  pos = 0;
  constructor(public buf: Uint8Array, public end = buf.length) {}
  varint(): number {
    let result = 0, shift = 0, b: number;
    do {
      b = this.buf[this.pos++];
      result += (b & 0x7f) * 2 ** shift;
      shift += 7;
    } while (b & 0x80);
    return result;
  }
  bytes(): Uint8Array {
    const len = this.varint();
    const out = this.buf.subarray(this.pos, this.pos + len);
    this.pos += len;
    return out;
  }
  skip(wire: number) {
    if (wire === 0) this.varint();
    else if (wire === 1) this.pos += 8;
    else if (wire === 2) this.pos += this.varint();
    else if (wire === 5) this.pos += 4;
    else throw new Error(`mvt: wire type ${wire}`);
  }
}

const text = new TextDecoder();
const zigzag = (n: number) => (n % 2 ? -(n + 1) / 2 : n / 2);
function packed(b: Uint8Array): number[] {
  const r = new Reader(b), out: number[] = [];
  while (r.pos < r.end) out.push(r.varint());
  return out;
}

function value(b: Uint8Array): string | number | boolean {
  const r = new Reader(b);
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let v: string | number | boolean = "";
  while (r.pos < r.end) {
    const tag = r.varint(), field = tag >> 3;
    if (field === 1) v = text.decode(r.bytes());
    else if (field === 2) { v = view.getFloat32(r.pos, true); r.pos += 4; }
    else if (field === 3) { v = view.getFloat64(r.pos, true); r.pos += 8; }
    else if (field === 4 || field === 5) v = r.varint();
    else if (field === 6) v = zigzag(r.varint());
    else if (field === 7) v = r.varint() !== 0;
    else r.skip(tag & 7);
  }
  return v;
}

function geometry(cmds: number[]): Pt[][] {
  const rings: Pt[][] = [];
  let ring: Pt[] | null = null, x = 0, y = 0, i = 0;
  while (i < cmds.length) {
    const c = cmds[i++], id = c & 7, count = c >> 3;
    if (id === 7) {
      if (ring?.length) ring.push({ ...ring[0] });
      continue;
    }
    for (let k = 0; k < count; k++) {
      x += zigzag(cmds[i++]);
      y += zigzag(cmds[i++]);
      if (id === 1) {
        ring = [];
        rings.push(ring);
      }
      ring!.push({ x, y });
    }
  }
  return rings;
}

function layer(b: Uint8Array): MvtLayer {
  const r = new Reader(b);
  let name = "", extent = 4096;
  const keys: string[] = [], values: (string | number | boolean)[] = [], raw: { type: number; tags: number[]; geom: number[] }[] = [];
  while (r.pos < r.end) {
    const tag = r.varint(), field = tag >> 3;
    if (field === 1) name = text.decode(r.bytes());
    else if (field === 3) keys.push(text.decode(r.bytes()));
    else if (field === 4) values.push(value(r.bytes()));
    else if (field === 5) extent = r.varint();
    else if (field === 2) {
      const f = new Reader(r.bytes());
      const feat = { type: 0, tags: [] as number[], geom: [] as number[] };
      while (f.pos < f.end) {
        const t = f.varint(), fld = t >> 3;
        if (fld === 2) feat.tags = packed(f.bytes());
        else if (fld === 3) feat.type = f.varint();
        else if (fld === 4) feat.geom = packed(f.bytes());
        else f.skip(t & 7);
      }
      raw.push(feat);
    } else r.skip(tag & 7);
  }
  const features = raw.map((f) => {
    const props: MvtFeature["props"] = {};
    for (let i = 0; i + 1 < f.tags.length; i += 2) props[keys[f.tags[i]]] = values[f.tags[i + 1]];
    return { type: f.type, props, geom: geometry(f.geom) };
  });
  return { name, extent, features };
}

export function readTile(buf: Uint8Array): MvtLayer[] {
  const r = new Reader(buf), layers: MvtLayer[] = [];
  while (r.pos < r.end) {
    const tag = r.varint();
    if (tag >> 3 === 3) layers.push(layer(r.bytes()));
    else r.skip(tag & 7);
  }
  return layers;
}
