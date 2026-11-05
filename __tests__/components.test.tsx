// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { ChatForm } from "@/app/components/ChatForm"
import { AuthForm } from "@/app/components/AuthForm"

const { sendMessageAction } = vi.hoisted(() => ({
  sendMessageAction: vi.fn(),
}))

vi.mock("@/actions/conversations", () => ({ sendMessageAction }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("ChatForm", () => {
  it("sender melding med riktig samtale-id", async () => {
    sendMessageAction.mockResolvedValue({})
    render(<ChatForm conversationId={7} />)

    fireEvent.change(screen.getByLabelText("Melding"), {
      target: { value: "Hei AI" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    await vi.waitFor(() => expect(sendMessageAction).toHaveBeenCalledTimes(1))
    const formData = sendMessageAction.mock.calls[0][0] as FormData
    expect(formData.get("conversationId")).toBe("7")
    expect(formData.get("content")).toBe("Hei AI")
  })

  it("viser feilmelding når server action feiler", async () => {
    sendMessageAction.mockResolvedValue({ error: "Fikk ikke svar fra AI" })
    render(<ChatForm conversationId={1} />)

    fireEvent.change(screen.getByLabelText("Melding"), {
      target: { value: "Hei" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Fikk ikke svar fra AI"
    )
  })
})

describe("AuthForm", () => {
  it("viser feltene og feilen fra server action", async () => {
    const action = vi.fn(async () => ({ error: "Feil e-post eller passord" }))
    render(
      <AuthForm
        title="Logg inn"
        action={action}
        submitLabel="Logg inn"
        fields={[
          { name: "email", label: "E-post", type: "email" },
          { name: "password", label: "Passord", type: "password" },
        ]}
      />
    )

    fireEvent.change(screen.getByLabelText("E-post"), {
      target: { value: "ola@test.no" },
    })
    fireEvent.change(screen.getByLabelText("Passord"), {
      target: { value: "feil" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Logg inn" }))

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Feil e-post eller passord"
    )
    expect(action).toHaveBeenCalledTimes(1)
  })
})
