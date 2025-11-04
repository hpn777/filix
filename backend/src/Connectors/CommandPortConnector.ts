import * as net from 'net'
import { Observable } from 'rxjs'

interface ConnectionOptions {
  port: number
  host: string
}

interface Connection extends net.Socket {
  send: (message: string) => void
  connect$: Observable<boolean>
  error$: Observable<Error>
  data$: Observable<string>
}

const createConnection = (options: ConnectionOptions): Connection => {
  const connection = net.createConnection(options) as Connection
  connection.setEncoding('utf8')

  connection.send = (message: string) => {
    connection.write(`${message}\n`)
  }

  connection.connect$ = new Observable(observer => {
    connection.on('connect', () => {
      observer.next(true)
    })
  })

  connection.error$ = new Observable(observer => {
    connection.on('error', (error: Error) => {
      observer.next(error)
    })
  })

  connection.data$ = new Observable(observer => {
    connection.on('data', (data: string) => {
      data = data.replace(/#(?:[a-z][a-z0-9_]*)\@.*?\([0-9]*\)\:/, '')
      observer.next(data)
    })

    connection.on('close', () => {
      observer.complete()
    })
  })

  return connection
}

const CommandPortConnector = (
  config: ConnectionOptions,
): Promise<Connection> => {
  return new Promise(resolve => {
    const connection = createConnection(config)

    connection.connect$.subscribe(() => {
      resolve(connection)
    })
  })
}

export default CommandPortConnector
