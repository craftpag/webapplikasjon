"use client"

import { useActionState } from "react"
import type { FormState } from "@/actions/auth"

type Field = {
  name: string
  label: string
  type: "text" | "email" | "password"
  minLength?: number
  autoComplete?: string
}

type Props = {
  title: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  fields: Field[]
  submitLabel: string
  children?: React.ReactNode
}

// Klientkomponent: felles skjema for innlogging og registrering.
// Viser feilmeldingen som server action returnerer.
export function AuthForm({ title, action, fields, submitLabel, children }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="auth">
      <h2>{title}</h2>

      {fields.map((f) => (
        <label key={f.name} htmlFor={f.name} className="field">
          {f.label}
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            className="input"
            required
            minLength={f.minLength}
            autoComplete={f.autoComplete}
          />
        </label>
      ))}

      {state.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="primary">
        {pending ? "Vent…" : submitLabel}
      </button>

      {children}
    </form>
  )
}
