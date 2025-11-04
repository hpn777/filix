import { tailLogConnector } from './TailLogConnector'
import { UdpDiscovery } from './UDPDiscovery'
import CommandPortConnector from './CommandPortConnector'

const udpDiscovery = (config: any) => new UdpDiscovery(config)

export {
  tailLogConnector,
  CommandPortConnector as commandPortConnector,
  udpDiscovery,
}
