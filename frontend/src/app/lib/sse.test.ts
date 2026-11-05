import { describe, expect, it } from 'vitest'
import { parseSSE, type SSEEvent } from './sse'

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const events: SSEEvent[] = []
  for await (const event of parseSSE(stream)) events.push(event)
  return events
}

describe('parseSSE', () => {
  it('leser hendelser med navn og data', async () => {
    const events = await collect(
      streamOf('event: delta\ndata: "Hei"\n\nevent: done\ndata: \n\n'),
    )

    expect(events).toEqual([
      { event: 'delta', data: '"Hei"' },
      { event: 'done', data: '' },
    ])
  })

  it('setter sammen en hendelse som er delt over flere biter', async () => {
    const events = await collect(streamOf('event: del', 'ta\ndata: "He', 'i"\n', '\n'))

    expect(events).toEqual([{ event: 'delta', data: '"Hei"' }])
  })

  it('bruker message som navn når event mangler', async () => {
    const events = await collect(streamOf('data: linje 1\ndata: linje 2\n\n'))

    expect(events).toEqual([{ event: 'message', data: 'linje 1\nlinje 2' }])
  })
})
