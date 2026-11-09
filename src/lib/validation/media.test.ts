import { describe, expect, it } from "vitest";
import { detectType, uploadRequestSchema } from "./media";

const bytes = (...n: number[]) => Uint8Array.from([...n, ...Array(16).fill(0)]);
const ascii = (s: string) => Uint8Array.from([...s].map((c) => c.charCodeAt(0)));

describe("detectType", () => {
  it("recognizes allowed formats by content", () => {
    expect(detectType(bytes(0xff, 0xd8, 0xff))).toBe("image/jpeg");
    expect(detectType(bytes(0x89, 0x50, 0x4e, 0x47))).toBe("image/png");
    expect(detectType(ascii("%PDF-1.7"))).toBe("application/pdf");
    expect(detectType(ascii("GIF89a"))).toBe("image/gif");
    const webp = ascii("RIFF....WEBPVP8 "); expect(detectType(webp)).toBe("image/webp");
  });
  it("rejects scripts and unknown content", () => {
    expect(detectType(ascii("<script>alert(1)</script>"))).toBeNull();
    expect(detectType(ascii("<svg xmlns='http://www.w3.org'>"))).toBeNull();
  });
});

describe("uploadRequestSchema", () => {
  it("enforces type and size limits", () => {
    expect(uploadRequestSchema.safeParse({ filename: "a.png", contentType: "image/png", size: 1000 }).success).toBe(true);
    expect(uploadRequestSchema.safeParse({ filename: "a.svg", contentType: "image/svg+xml", size: 1000 }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ filename: "a.png", contentType: "image/png", size: 9 * 1024 * 1024 }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ filename: "a.pdf", contentType: "application/pdf", size: 15 * 1024 * 1024 }).success).toBe(true);
  });
});
