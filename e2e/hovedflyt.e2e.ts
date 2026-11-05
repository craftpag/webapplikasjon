// E2e-test av hovedflyten i en ekte nettleser:
// registrer -> logg inn -> lag samtale -> send melding -> se samtalen igjen.
import { test, expect } from "@playwright/test"

test("bruker kan logge inn, lage en samtale og se den igjen", async ({ page }) => {
  const email = `e2e-${Date.now()}@test.no`

  // Uinnlogget bruker sendes til innlogging
  await page.goto("/")
  await expect(page).toHaveURL(/\/login$/)

  // Registrer
  await page.getByRole("link", { name: "Registrer deg" }).click()
  await page.getByLabel("Navn").fill("E2e Bruker")
  await page.getByLabel("E-post").fill(email)
  await page.getByLabel("Passord (minst 6 tegn)").fill("hemmelig123")
  await page.getByRole("button", { name: "Registrer" }).click()
  await expect(page).toHaveURL(/\/login$/)

  // Feil passord gir feilmelding
  await page.getByLabel("E-post").fill(email)
  await page.getByLabel("Passord").fill("feil-passord")
  await page.getByRole("button", { name: "Logg inn" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "Feil e-post eller passord" })).toBeVisible()

  // Logg inn
  await page.getByLabel("E-post").fill(email)
  await page.getByLabel("Passord").fill("hemmelig123")
  await page.getByRole("button", { name: "Logg inn" }).click()
  await expect(page.getByRole("heading", { name: "GPT Wrapper" })).toBeVisible()

  // Lag en samtale
  await page.getByPlaceholder("Tittel på samtale").fill("E2e-samtale")
  await page.getByRole("button", { name: "Opprett" }).click()
  await expect(page.getByRole("heading", { name: "E2e-samtale" })).toBeVisible()

  // Send en melding og få svar (demo-modus, ingen ekte API-kall)
  await page.getByLabel("Melding").fill("Hei fra Playwright")
  await page.getByRole("button", { name: "Send" }).click()
  await expect(page.getByText("Hei fra Playwright")).toBeVisible()
  await expect(page.getByText("[Demo]")).toBeVisible()

  // Se den igjen: tilbake til lista og inn i samtalen
  await page.getByRole("link", { name: /Tilbake/ }).click()
  await page.getByRole("link", { name: /E2e-samtale/ }).click()
  await expect(page.getByText("Hei fra Playwright")).toBeVisible()
})
