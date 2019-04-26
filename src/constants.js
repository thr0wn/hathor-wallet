/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Networks } from 'bitcore-lib';

/**
 * Constants defined for the Hathor Wallet
 * @module Constants
 */

/**
 * Quantity of elements to show in the wallet history
 */
export const WALLET_HISTORY_COUNT = 10;

/**
 * Quantity of decimal places of tokens amount
 */
export const DECIMAL_PLACES = 2;

/**
 * ID of the genesis block
 */
export const GENESIS_BLOCK = [
  '000164e1e7ec7700a18750f9f50a1a9b63f6c7268637c072ae9ee181e58eb01b'
]

/**
 * ID of the genesis transactions
 */
export const GENESIS_TX = [
  '00029b7f8051f6ebdc0338d02d4a8cfbd662500ee03224bbee75a6f2da0350b0',
  '0001e887c7b5ec3b4e57033d849a80d8bccbe3a749abfa87cc31c663530f3f4e'
]

/**
 * How many addresses we can have without being used
 */
export const GAP_LIMIT = 20;

/**
 * Wallet version
 */
export const VERSION = '0.7.0-beta';

/**
 * Minimum expected API version
 */
export const MIN_API_VERSION = '0.24.0-beta';

/**
 * Before this version the data in localStorage from the wallet is not compatible  
 * So we must reset the wallet to continue using it
 */
export const FIRST_WALLET_COMPATIBLE_VERSION = '0.5.0-beta';

/**
 * If we should forbid to generate a quantity of unused addresses more than the GAP_LIMIT
 */
export const LIMIT_ADDRESS_GENERATION = true;

/**
 * Hathor address BIP44 code  
 * (listed here: https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
 */
export const HATHOR_BIP44_CODE = 280;

/**
 * Server options for the user to choose which one to connect
 */
export const DEFAULT_SERVERS = [
  'https://node1.alfa.testnet.hathor.network/v1/',
  'https://node2.alfa.testnet.hathor.network/v1/',
  'https://node3.alfa.testnet.hathor.network/v1/',
  'https://node4.alfa.testnet.hathor.network/v1/',
];

/**
 * Default server user will connect when none have been chosen
 */
export const DEFAULT_SERVER = DEFAULT_SERVERS[0];

/**
 * Transaction version field
 */
// FIXME tx version should not be hardcoded
export const DEFAULT_TX_VERSION  = 1;

/**
 * Max value (inclusive) before having to use 8 bytes: 2147483648 ~= 2.14748e+09
 */
export const MAX_OUTPUT_VALUE_32 = 2 ** 31 - 1;

/**
 * Max accepted value for an output
 * Because of a precision problem in javascript we don't handle all 8 bytes of value
 */
export const MAX_OUTPUT_VALUE = 2 ** 43;

/**
 * Max level of the graph generated by the full node in the transaction detail screen
 */
export const MAX_GRAPH_LEVEL = 1

/**
 * How many words will be used to validate the backup
 */
export const WORDS_VALIDATION = 6

/**
 * Entropy for the new HD wallet words
 */
export const HD_WALLET_ENTROPY = 256

/**
 * Message to be written when user wants to reset all wallet data
 */
export const CONFIRM_RESET_MESSAGE = 'I want to reset my wallet';

/**
 * Password regex pattern for validation
 * - The string must contain at least 1 lowercase alphabetical character
 * - The string must contain at least 1 uppercase alphabetical character
 * - The string must contain at least 1 numeric character
 * - The string must contain at least one special character (!@#$%^&)
 * - The string must be eight characters or longer
 */
export const PASSWORD_PATTERN = "(?=^.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$"

/**
 * Mask to get token index from token data
 */
export const TOKEN_INDEX_MASK = 0b01111111

/**
 * Mask to check if it's authority output (first bit indicates it)
 */
export const TOKEN_AUTHORITY_MASK = 0b10000000

/**
 * Mask to check if it's token id creation UTXO (last bit indicates it)
 */
export const TOKEN_CREATION_MASK = 0b00000001

/**
 * Mask to check if it's mint UTXO (second to last bit indicates it)
 */
export const TOKEN_MINT_MASK = 0b00000010

/**
 * Mask to check if it's melt UTXO (third bit from right to left indicates it)
 */
export const TOKEN_MELT_MASK = 0b00000100

/**
 * Hathor token config
 */
export const HATHOR_TOKEN_CONFIG = {'name': 'Hathor', 'symbol': 'HTR', 'uid': '00'};

/**
 * Hathor token default index
 */
export const HATHOR_TOKEN_INDEX = 0;

/**
 * Local storage data useful for debugging purposes.  
 * WARNING: we cannot include any arbitrarily large fields (e.g. wallet:data) on Sentry request.  
 * WARNING: the request has a max size of 200kb and if it is bigger than this it'll be denied by Sentry.
 */
export const DEBUG_LOCAL_DATA_KEYS = [
  `wallet:server`,
  `wallet:tokens`,
  `wallet:started`,
  `wallet:backup`,
  `wallet:locked`,
  `wallet:closed`,
  `wallet:lastSharedIndex`,
  `wallet:lastGeneratedIndex`,
  `wallet:lastUsedIndex`,
  `wallet:lastUsedAddress`,
  `wallet:address`
]

// Version bytes for address generation
// Mainnet: P2PKH will start with H and P2SH will start with h
// Testnet: P2PKH will start with W and P2SH will start with w
const versionBytes = {
  'mainnet': {
    'p2pkh': 0x28,
    'p2sh': 0x64,
  },
  'testnet': {
    'p2pkh': 0x49,
    'p2sh': 0x87,
  },
}

// Networks is an object of the bitcore-lib
// Some of it's parameters are not used by us (network parameters), so I just kept their default
// name: network name
// alias: another name we can use as the network name
// pubkeyhash: prefix for p2pkh addresses
// scripthash: prefix for p2sh addresses
// privatekey: prefix for private key WIF (Wallet Import Format)
// xpubkey: prefix for xpubkeys (we will use 'xpub' for both mainnet and testnet)
// xprivkey: prefix for xprivkeys (we will use 'xprv' for both mainnet and testnet)
// networkMagic: used to send messages through the network (not used by us)
// port: used to connect to the network (not used by us)
// dnsSeed: list of dns to connect (not used by us)

const mainnet = Networks.add({
  name: 'mainnet',
  alias: 'production',
  pubkeyhash: versionBytes['mainnet']['p2pkh'],
  privatekey: 0x80,
  scripthash: versionBytes['mainnet']['p2sh'],
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xf9beb4d9,
  port: 8333,
  dnsSeeds: []
});

const testnet = Networks.add({
  name: 'testnet',
  alias: 'test',
  pubkeyhash: versionBytes['testnet']['p2pkh'],
  privatekey: 0x80,
  scripthash: versionBytes['testnet']['p2sh'],
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xf9beb4d9,
  port: 8333,
  dnsSeeds: []
});

const networks = {
  testnet,
  mainnet
}

const currentNetwork = process.env.HATHOR_WALLET_NETWORK || 'testnet';

/**
 * Version byte for the P2PKH address
 */
export const P2PKH_BYTE = versionBytes[currentNetwork].p2pkh;

/**
 * Version byte for the P2SH address
 */
export const P2SH_BYTE = versionBytes[currentNetwork].p2sh;

/**
 * Selected address ('mainnet' or 'testnet')  
 * Selected using HATHOR_WALLET_NETWORK environment variable
 */
export const NETWORK = networks[currentNetwork];

/**
 * Quantity of blocks to show per page in the dashboard
 */
export const DASHBOARD_BLOCKS_COUNT = 6;

/**
 * Quantity of transactions to show per page in the dashboard
 */
export const DASHBOARD_TX_COUNT = 6;

/**
 * Quantity of elements to show per page in the transactions/blocks list
 */
export const TX_COUNT = 10;

/**
 * Sentry connection DSN
 */
export const SENTRY_DSN = process.env.SENTRY_DSN || 'https://69c067d1587c465cac836eaf25467ce1@sentry.io/1410476'

/**
 * Default timeout for each request in milliseconds
 */
export const TIMEOUT = 10000;

/**
 * Default timeout for send tokens request in milliseconds
 */
export const SEND_TOKENS_TIMEOUT = 300000;
