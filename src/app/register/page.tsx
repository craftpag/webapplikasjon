import { registerAction } from "@/actions/auth"
import { AuthForm } from "@/app/components/AuthForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="page">
      <header className="header">
        <span className="brand">GPT Wrapper</span>
      </header>

      <AuthForm
        title="Registrer deg"
        action={registerAction}
        submitLabel="Registrer"
        fields={[
          { name: "name", label: "Navn", type: "text", autoComplete: "name" },
          { name: "email", label: "E-post", type: "email", autoComplete: "email" },
          {
            name: "password",
            label: "Passord (minst 6 tegn)",
            type: "password",
            minLength: 6,
            autoComplete: "new-password",
          },
        ]}
      >
        <p className="hint">
          Har du konto? <Link href="/login">Logg inn</Link>
        </p>
      </AuthForm>
    </div>
  )
}
