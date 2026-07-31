"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { issuesToFieldErrors, loginSchema } from "@/lib/validation";

export interface AuthActionState {
  message: string;
  errors?: Record<string, string[]>;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      message: "Bilgilerinizi kontrol edin.",
      errors: issuesToFieldErrors(result.error.issues),
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(result.data);
    if (error) return { message: "E-posta veya şifre hatalı." };
  } catch {
    return { message: "Giriş servisine ulaşılamadı. Lütfen tekrar deneyin." };
  }

  redirect("/panel");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/giris");
}
