import { loginAction } from "@/actions/auth"
import { AuthForm } from "@/app/components/AuthForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="page">
      <header className="header">
        <span className="brand">GPT Wrapper</span>
      </header>

      <AuthForm
        title="Logg inn"
        action={loginAction}
        submitLabel="Logg inn"
        fields={[
          { name: "email", label: "E-post", type: "email", autoComplete: "email" },
          { name: "password", label: "Passord", type: "password", autoComplete: "current-password" },
        ]}
      >
        <p className="hint">
          Har du ikke konto? <Link href="/register">Registrer deg</Link>
        </p>
      </AuthForm>
    </div>
  )
}
