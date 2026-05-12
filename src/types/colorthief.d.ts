declare module "colorthief" {
  import { Readable } from "stream";

  export function getColor(
    source: Buffer | Readable | string,
    quality?: number
  ): Promise<[number, number, number]>;

  export function getPalette(
    source: Buffer | Readable | string,
    colorCount?: number,
    quality?: number
  ): Promise<[number, number, number][]>;
}
