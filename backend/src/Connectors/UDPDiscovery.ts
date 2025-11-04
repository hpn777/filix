import * as dgram from 'dgram'
import { fromEvent, empty, Observable } from 'rxjs'
import { map, filter, take, timeout, catchError } from 'rxjs/operators'
import { generateGuid } from '../utils/generateGuid'

type UdpConfig = {
  udpPort: number
  multicastPort: number
  multicastHost: string
}

type UdpResponse = {
  data: any
  sender: dgram.RemoteInfo
  success: boolean
  error?: any
}

type SendOptions = {
  timeout?: number
  nrOfRetries?: number
  port?: number
  host?: string
}

type Request = {
  requestId: string
  [key: string]: any
}

export class UdpDiscovery {
  private udpEndPoint: dgram.Socket
  public all$: Observable<UdpResponse>
  public message$: Observable<UdpResponse>
  public error$: Observable<UdpResponse>
  private config: UdpConfig

  constructor(config: UdpConfig) {
    this.config = config
    this.udpEndPoint = dgram.createSocket('udp4')

    this.udpEndPoint.on('error', (err) => {
      console.log(err)
    })

    this.all$ = fromEvent<[Buffer, dgram.RemoteInfo]>(this.udpEndPoint, 'message').pipe(
      map((msg) => {
        try {
          const response: UdpResponse = {
            data: JSON.parse(msg[0].toString()),
            sender: msg[1],
            success: true,
          }
          return response
        } catch (ex) {
          return {
            data: null,
            sender: msg[1],
            success: false,
            error: ex,
          }
        }
      }),
    )

    this.message$ = this.all$.pipe(filter((response) => response.success))
    this.error$ = this.all$.pipe(filter((response) => !response.success))

    this.udpEndPoint.bind(config.udpPort, 'localhost')
    
    this.udpEndPoint.on('listening', () => {
      console.info(`UDP Discovery started on port: ${config.udpPort}`)
    })
    
    this.udpEndPoint.on('error', (err) => {
      console.error('UDP Discovery error:', err)
    })
  }

  public send(data: any, options?: SendOptions): Observable<UdpResponse> {
    const defaultOptions: SendOptions = {
      timeout: 2000,
      nrOfRetries: 1,
      port: this.config.multicastPort,
      host: this.config.multicastHost,
    }

    const mergedOptions = { ...defaultOptions, ...options }

    const request: Request = {
      requestId: generateGuid(),
      ...data,
    }

    const message = JSON.stringify(request)
    const buffer = Buffer.from(message)

    this.udpEndPoint.send(
      buffer,
      0,
      buffer.length,
      this.config.multicastPort,
      this.config.multicastHost,
    )

    return this.message$.pipe(
      filter((response) => response.data.requestId === request.requestId),
      take(1),
      timeout(mergedOptions.timeout!),
      catchError(() => {
        if (
          mergedOptions.nrOfRetries === undefined ||
          --mergedOptions.nrOfRetries! > 0
        ) {
          return this.send(data, mergedOptions)
        }
        return empty()
      }),
    )
  }

  public discover(
    serviceName: string,
    options?: SendOptions,
  ): Observable<UdpResponse> {
    const defaultOptions: SendOptions = {
      timeout: 2000,
      nrOfRetries: undefined,
    }

    return this.send(
      {
        serviceName,
        command: 'discovery',
      },
      { ...defaultOptions, ...options },
    )
  }
}
