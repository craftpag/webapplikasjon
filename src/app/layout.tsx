import "./globals.css"

export const metadata = {
  title: "GPT Wrapper",
  description: "Chat med OpenAI og Anthropic",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  )
}
