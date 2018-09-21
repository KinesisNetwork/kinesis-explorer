export interface Connection {
  horizonURL: string
  name: string
  networkPassphrase: string
  currency: 'KAU' | 'KAG'
  stage: 'testnet' | 'mainnet'
}
