export type SSEEvent = {
  event: string
  data: string
}

// Leser en text/event-stream og gir én hendelse om gangen
export async function* parseSSE(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SSEEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += decoder.decode(value, { stream: true })

    // En hendelse slutter med en tom linje, men kan være delt over flere biter
    let end = buffer.indexOf('\n\n')
    while (end !== -1) {
      yield parseEvent(buffer.slice(0, end))
      buffer = buffer.slice(end + 2)
      end = buffer.indexOf('\n\n')
    }
  }
}

function parseEvent(block: string): SSEEvent {
  let event = 'message'
  const data: string[] = []

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim()
    } else if (line.startsWith('data:')) {
      data.push(line.slice('data:'.length).replace(/^ /, ''))
    }
  }

  return { event, data: data.join('\n') }
}
