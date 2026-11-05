"use client"

import { useActionState } from "react"
import type { FormState } from "@/actions/auth"

type Field = {
  name: string
  label: string
  type: "text" | "email" | "password"
  minLength?: number
}

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  fields: Field[]
  submitLabel: string
}

// Klientkomponent: felles skjema for innlogging og registrering.
// Viser feilmeldingen som server action returnerer.
export function AuthForm({ action, fields, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction}>
      {fields.map((f) => (
        <div key={f.name} style={{ marginBottom: 12 }}>
          <label htmlFor={f.name}>{f.label}</label>
          <br />
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            required
            minLength={f.minLength}
            style={{ padding: 8, width: "100%" }}
          />
        </div>
      ))}

      {state.error && (
        <p role="alert" style={{ color: "red" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} style={{ padding: "8px 20px" }}>
        {pending ? "Vent..." : submitLabel}
      </button>
    </form>
  )
}
