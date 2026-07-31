import { describe, expect, it } from "vitest";
import { invoiceFormSchema, isValidTc } from "@/lib/validation";

describe("TC Kimlik No doğrulama", () => {
  it("algoritmik olarak geçerli TC numarasını kabul eder", () => {
    expect(isValidTc("10000000146")).toBe(true);
  });

  it("hatalı ve sıfırla başlayan numaraları reddeder", () => {
    expect(isValidTc("10000000145")).toBe(false);
    expect(isValidTc("00000000000")).toBe(false);
  });
});

describe("fatura formu", () => {
  it("Türkçe ondalık değerleri sayıya dönüştürür", () => {
    const result = invoiceFormSchema.parse({
      tc: "10000000146",
      customerName: "Ayşe Yılmaz",
      product: "24 Ayar",
      gram: "12,345",
      gramPrice: "3.250,50".replace(".", ""),
      status: "bekliyor",
    });
    expect(result.gram).toBe(12.345);
    expect(result.gramPrice).toBe(3250.5);
  });

  it("negatif gramı ve yanlış ürünü reddeder", () => {
    const result = invoiceFormSchema.safeParse({
      tc: "10000000146",
      customerName: "",
      product: "22 Ayar",
      gram: "-2",
      gramPrice: "3200",
      status: "bekliyor",
    });
    expect(result.success).toBe(false);
  });
});
