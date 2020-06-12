import { Connection } from "../types";

const networkConnections: Connection[] = [
  {
    name: "Kinesis KAU Mainnet",
    horizonURL: "https://kau-mainnet.kinesisgroup.io",
    networkPassphrase: "Kinesis Live",
    stage: "mainnet",
    currency: "KAU",
  },
  {
    name: "Kinesis KAG Mainnet",
    horizonURL: "https://kag-mainnet.kinesisgroup.io",
    networkPassphrase: "Kinesis KAG Live",
    stage: "mainnet",
    currency: "KAG",
  },
  {
    name: "Kinesis KAU Testnet",
    horizonURL: "https://kau-testnet.kinesisgroup.io",
    networkPassphrase: "Kinesis UAT",
    stage: "testnet",
    currency: "KAU",
  },
  {
    name: "Kinesis KAG Testnet",
    horizonURL: "https://kag-testnet.kinesisgroup.io",
    networkPassphrase: "Kinesis KAG UAT",
    stage: "testnet",
    currency: "KAG",
  },
];

export async function fetchConnections(): Promise<Connection[]> {
  const connections: Connection[] = networkConnections;
  return connections;
}

export {
  ConnectionContext,
  ConnectionContainer,
  ConnectionContextHandlers,
} from "./ConnectionContext";
