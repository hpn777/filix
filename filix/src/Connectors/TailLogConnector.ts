import * as Rx from 'rx'
import { Tail } from 'tail'

type TailLogConfig = {
  path: string
  encoding?: string
  suppress?: string[]
  separator?: string
}

type LogEntry = {
  id: number
  timestamp: number
  host?: string
  appName?: string
  slice?: string
  pId?: string
  type?: string
  msg: string
  count: number
}

export const tailLogConnector = (config: TailLogConfig): any => {
  let row_id = 1
  let repetitionBuffer: string | undefined
  let repetitionBufferCount = 0

  const suppress = config.suppress || ['tcpflow', 'survtimeline3', 'tpmonitor']

  const parseLog = (txt: string): LogEntry | {} => {
    const m = txt.split(
      /^((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))\ *((?:(?:[0-2]?\d{1})|(?:[3][01]{1})))(?![\d])\ ((?:(?:[0-1][0-9])|(?:[2][3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9])?(?:\s?(?:am|AM|pm|PM))?)\ (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-z0-9]*)\ ([a-z0-9_]*)(?:-slice(\d+))?(?:\[(.*?)\])?\:\ (\d+\ )?(?:(I|W|E|D)?\d{0,2}\ )(.*)/g,
    )

    if (m.length !== 1) {
      const tempTime = new Date()
      const timestamp =
        (new Date(
          `${m[1]} ${m[2]} ${tempTime.getFullYear()} ${m[3]}`,
        ).getTime() *
          1000 +
          Number(m[8])) *
        1000

      if (suppress.indexOf(m[5]) !== -1) {
        const srcFileName = m[10].split(' ')[0]
        if (repetitionBuffer === srcFileName) {
          --row_id
          repetitionBufferCount++
        } else {
          repetitionBuffer = srcFileName
          repetitionBufferCount = 1
        }
      } else {
        repetitionBufferCount = 1
      }

      const data: LogEntry = {
        id: row_id,
        timestamp,
        host: m[4],
        appName: m[5],
        slice: m[6],
        pId: m[7],
        type: m[9],
        msg: m[10],
        count: repetitionBufferCount,
      }

      row_id++

      return data
    }

    if (txt) {
      return {
        id: row_id++,
        timestamp: new Date().getTime() * 1000000,
        msg: txt,
        count: 1,
      }
    }

    return {}
  }

  config.encoding = config.encoding || 'ascii'
  const outputPath = config.path

  const tail = new Tail(
    outputPath,
    undefined,
    { encoding: config.encoding, follow: true },
    true,
  )

  const tailStream: any = Rx.Observable.fromEvent(tail, 'line').map(parseLog)

  tailStream.watch = () => {
    tail.watch()
  }

  tailStream.unwatch = () => {
    tail.unwatch()
  }

  return tailStream
}
