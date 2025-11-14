import { tailLogConnector } from './TailLogConnector';
import { UdpDiscovery } from './UDPDiscovery';
import CommandPortConnector from './CommandPortConnector';
declare const udpDiscovery: (config: any) => UdpDiscovery;
export { tailLogConnector, CommandPortConnector as commandPortConnector, udpDiscovery, };
