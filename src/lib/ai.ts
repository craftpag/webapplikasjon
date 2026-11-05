// Kaller OpenAI eller Anthropic

export async function askAI(
  provider: string,
  chatMessages: { role: string; content: string }[]
): Promise<string> {
  if (provider === "openai") {
    return callOpenAI(chatMessages)
  }
  if (provider === "anthropic") {
    return callAnthropic(chatMessages)
  }
  throw new Error("Ukjent leverandør: " + provider)
}

async function callOpenAI(
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return "[Demo] OpenAI API-nøkkel mangler. Sett OPENAI_API_KEY i .env"
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  })

  if (!res.ok) {
    throw new Error("OpenAI svarte med status " + res.status)
  }

  const data = (await res.json()) as any
  return data.choices[0].message.content
}

async function callAnthropic(
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return "[Demo] Anthropic API-nøkkel mangler. Sett ANTHROPIC_API_KEY i .env"
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages,
    }),
  })

  if (!res.ok) {
    throw new Error("Anthropic svarte med status " + res.status)
  }

  const data = (await res.json()) as any
  return data.content[0].text
}
