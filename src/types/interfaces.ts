export interface Connection {
  horizonURL: string
  name: string
  networkPassphrase: string
  currency: 'KAU' | 'KAG' | 'KEM'
  stage: 'testnet' | 'mainnet'
}
