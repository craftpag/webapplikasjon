"use client"

import { logoutAction } from "@/actions/auth"

export function LogoutButton() {
  return (
    <form action={logoutAction} style={{ display: "inline" }}>
      <button type="submit" style={{ padding: "4px 12px" }}>
        Logg ut
      </button>
    </form>
  )
}
