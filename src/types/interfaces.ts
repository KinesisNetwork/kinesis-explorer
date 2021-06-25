export interface Connection {
  name: string
  length: number
  currency: ['KAU', 'KAG']
  kau: {
    horizonURL: string
    name: string
    networkPassphrase: string
    currency: 'KAU'
    stage: 'testnet' | 'mainnet',
  }
  kag: {
    horizonURL: string
    name: string
    networkPassphrase: string
    currency: 'KAG'
    stage: 'testnet' | 'mainnet',
  }
}

export interface OldConnection {
  horizonURL: string
  name: string
  networkPassphrase: string
  currency: 'KAU' | 'KAG'
  stage: 'testnet' | 'mainnet'
}
