import { describe, expect, it } from "vitest";
import { formatCurrency, formatDateTime, formatGram, maskTc, parseTurkishDecimal } from "@/lib/format";

describe("Türkçe biçimlendirme", () => {
  it("para ve gram değerlerini biçimlendirir", () => {
    expect(formatCurrency(12345.67)).toContain("12.345,67");
    expect(formatGram(12.345)).toBe("12,345 gr");
  });

  it("virgüllü ondalığı okur ve TC numarasını maskeler", () => {
    expect(parseTurkishDecimal("12,50")).toBe(12.5);
    expect(maskTc("10000000146")).toBe("100•••••146");
  });

  it("tarihi İstanbul saat diliminde gösterir", () => {
    const value = formatDateTime("2026-07-31T12:30:00.000Z");
    expect(value.time).toBe("15:30");
    expect(value.date).toContain("2026");
  });
});
