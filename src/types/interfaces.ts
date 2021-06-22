export interface Connection {
  length: number
  kau:{
  horizonURL: string
  name: string
  networkPassphrase: string
  currency: 'KAU' | 'KAG' 
  stage: 'testnet' | 'mainnet'
  }
  kag: {
  horizonURL: string
  name: string
  networkPassphrase: string
  currency: 'KAU' | 'KAG' 
  stage: 'testnet' | 'mainnet'
  }
}
