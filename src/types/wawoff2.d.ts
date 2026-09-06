/**
 * `wawoff2` ships no types. Declared to the shape actually used: the WASM port
 * of Google's woff2 tool, whose functions resolve to byte arrays.
 *
 * Only `decompress` is used here, to turn the committed woff2 subset into a TTF
 * that a rasteriser can read. See src/lib/og.ts.
 */
declare module 'wawoff2' {
    export function decompress(input: Uint8Array): Promise<Uint8Array>;
    export function compress(input: Uint8Array): Promise<Uint8Array>;
}
