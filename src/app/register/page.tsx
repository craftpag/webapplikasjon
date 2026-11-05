import { registerAction } from "@/actions/auth"
import { AuthForm } from "@/app/components/AuthForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <main style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h1>Registrer deg</h1>

      <AuthForm
        action={registerAction}
        submitLabel="Registrer"
        fields={[
          { name: "name", label: "Navn", type: "text" },
          { name: "email", label: "E-post", type: "email" },
          {
            name: "password",
            label: "Passord (minst 6 tegn)",
            type: "password",
            minLength: 6,
          },
        ]}
      />

      <p style={{ marginTop: 16 }}>
        Har du konto? <Link href="/login">Logg inn</Link>
      </p>
    </main>
  )
}
