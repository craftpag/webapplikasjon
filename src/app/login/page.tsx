import { loginAction } from "@/actions/auth"
import { AuthForm } from "@/app/components/AuthForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h1>Logg inn</h1>

      <AuthForm
        action={loginAction}
        submitLabel="Logg inn"
        fields={[
          { name: "email", label: "E-post", type: "email" },
          { name: "password", label: "Passord", type: "password" },
        ]}
      />

      <p style={{ marginTop: 16 }}>
        Har du ikke konto? <Link href="/register">Registrer deg</Link>
      </p>
    </main>
  )
}
