import { Connection } from '../types'

export async function fetchConnections(): Promise<Connection[]> {

  // for live
  // const response = await fetch(
  //   'https://s3-ap-southeast-2.amazonaws.com/kinesis-config/kinesis-server-details.json',
  // )

  // for UAT
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
