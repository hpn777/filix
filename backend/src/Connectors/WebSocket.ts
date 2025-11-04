import WS from 'ws'
import _ from 'underscore'

export interface WebSocketOptions {
  debug?: boolean
  reconnectInterval?: number
  timeoutInterval?: number
  url?: string
  protocols?: string[]
  onopen?: (event: any) => void
  onclose?: (event: any) => void
  onmessage?: (event: any) => void
  onerror?: (event: any) => void
}

export class WebSocket {
  debug = false
  reconnectInterval = 2000
  timeoutInterval = 2000
  url?: string
  protocols = ['json']
  onopen = (event: any): void => {}
  onclose = (event: any): void => {}
  onmessage = (event: any): void => {}
  onerror = (event: any): void => {}

  private ws?: WS
  private forcedClose = false
  private timedOut = false

  constructor(options: WebSocketOptions) {
    _.extend(this, options)
    this.connect(false)
  }

  private connect(reconnectAttempt: boolean): void {
    this.ws = new WS(this.url!)

    const timeout = setInterval(() => {
      this.timedOut = true
      this.ws?.close()
      this.timedOut = false
    }, this.timeoutInterval)

    this.ws.on('open', event => {
      clearTimeout(timeout)
      reconnectAttempt = false
      this.onopen(event)
    })

    this.ws.on('close', event => {
      this.ws = undefined
      this.onclose(event)
      setTimeout(() => {
        if (!this.forcedClose) this.connect(true)
      }, this.reconnectInterval)
    })

    this.ws.on('message', event => {
      this.onmessage(event)
    })

    this.ws.on('error', (event: any) => {
      if (
        event.code == 'ETIMEDOUT' ||
        event.code == 'ENOTFOUND' ||
        event.code == 'ECONNREFUSED'
      ) {
        clearTimeout(timeout)
        setTimeout(() => {
          this.connect(true)
        }, this.reconnectInterval)
      }
      this.onerror(event)
    })
  }

  send(data: string): void {
    if (this.ws) {
      return this.ws.send(data)
    } else {
      throw 'INVALID_STATE_ERR : Pausing to reconnect websocket'
    }
  }

  close(): void {
    if (this.ws) {
      this.forcedClose = true
      this.ws.close()
    }
  }

  refresh(): void {
    if (this.ws) {
      this.ws.close()
    }
  }
}
