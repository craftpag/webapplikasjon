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
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
