"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { loginAction, type AuthActionState } from "@/app/actions/auth-actions";

const initialState: AuthActionState = { message: "" };

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="primary-button mt-2 w-full" disabled={pending}>
      {pending && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
      {pending ? "Giriş yapılıyor…" : "Güvenli giriş"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="field-label">E-posta</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" className="field-input pl-11" placeholder="ornek@isletme.com" aria-describedby="email-error" required />
        </div>
        {state.errors?.email && <p id="email-error" className="mt-2 text-xs font-medium text-red-600">{state.errors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="field-label">Şifre</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
          <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="field-input px-11" placeholder="En az 8 karakter" aria-describedby="password-error" required />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl text-muted hover:text-ink" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}>
            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
        {state.errors?.password && <p id="password-error" className="mt-2 text-xs font-medium text-red-600">{state.errors.password[0]}</p>}
      </div>

      {state.message && !state.errors && (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400" role="alert">{state.message}</p>
      )}

      <LoginButton />
    </form>
  );
}
