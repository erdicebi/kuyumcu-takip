import { z } from "zod";
import { parseTurkishDecimal } from "@/lib/format";

export function isValidTc(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const digits = tc.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const eleventh = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10;
  return digits[9] === tenth && digits[10] === eleventh;
}

const decimalInput = (label: string, maximum: number, decimals: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} zorunludur`)
    .regex(new RegExp(`^\\d+(?:[.,]\\d{1,${decimals}})?$`), `${label} geçerli değil`)
    .transform(parseTurkishDecimal)
    .refine((value) => Number.isFinite(value) && value > 0, `${label} sıfırdan büyük olmalıdır`)
    .refine((value) => value <= maximum, `${label} izin verilen sınırı aşıyor`);

export const invoiceFormSchema = z.object({
  tc: z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{11}$/.test(value),
    "TC Kimlik No 11 haneli olmalıdır"
  ),
  customerName: z
    .string()
    .trim()
    .max(120, "Müşteri adı en fazla 120 karakter olabilir")
    .optional()
    .default(""),
  product: z.literal("24 Ayar", { message: "Ürün 24 Ayar olmalıdır" }),
  gram: decimalInput("Gram", 999999999.999, 3),
  gramPrice: decimalInput("Gram fiyatı", 999999999999.99, 2),
  status: z.enum(["bekliyor", "kesildi"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

export function issuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  return issues.reduce<Record<string, string[]>>((errors, issue) => {
    const key = String(issue.path[0] ?? "form");
    errors[key] = [...(errors[key] ?? []), issue.message];
    return errors;
  }, {});
}
