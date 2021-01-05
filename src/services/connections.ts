import { Connection } from '../types'

export async function fetchConnections(): Promise<Connection[]> {
  const response = await fetch(
    'https://kinesis-config.s3-ap-southeast-2.amazonaws.com/kinesis-server-details-uat.json',
  )
  const connections: Connection[] = await response.json()
  return connections
}

export {
  ConnectionContext,
  ConnectionContainer,
  ConnectionContextHandlers,
} from './ConnectionContext'
