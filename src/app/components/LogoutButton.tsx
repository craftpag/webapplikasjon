"use client"

import { logoutAction } from "@/actions/auth"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="reset">
        Logg ut
      </button>
    </form>
  )
}
