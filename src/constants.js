export const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8080/";

let tmp_ws_url = process.env.REACT_APP_WS_URL || "ws://127.0.0.1:8080/ws/";
if (!(tmp_ws_url.startsWith('ws:') || tmp_ws_url.startsWith('wss:'))) {
  if (tmp_ws_url.startsWith('/')) {
    tmp_ws_url = ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + tmp_ws_url;
  } else {
    tmp_ws_url = ((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + window.location.pathname + "/" + tmp_ws_url;
  }
}

export const WS_URL = tmp_ws_url;

export const WALLET_HISTORY_COUNT = 10;

export const DECIMAL_PLACES = 2;

export const GENESIS_BLOCK = [
  '000000a0f82cfee5431e03b071364970861ffa1b0633f73ca7f462987ec34195'
]

export const GENESIS_TX = [
  '000000831cff82fa730cbdf8640fae6c130aab1681336e2f8574e314a5533849',
  '0000001df6f77892cd562a2d7829bc17d0130546edfc6a81e0a431af4b8aa51e'
]

// How many addresses we can have without being used
export const GAP_LIMIT = 20;

// Wallet version
export const VERSION = '0.6.0-beta';

// Minimum expected API version
export const MIN_API_VERSION = '0.23.1-beta';

// Before this version the data in localStorage from the wallet is not compatible
// So we must reset the wallet to continue using it
export const FIRST_WALLET_COMPATIBLE_VERSION = '0.5.0-beta';

// If we should forbid to generate a quantity of
// unused addresses more than the GAP_LIMIT
export const LIMIT_ADDRESS_GENERATION = true;

export const HATHOR_BIP44_CODE = 280;

export const DEFAULT_SERVERS = [
  'https://node2.testnet.hathor.network/api/',
  'https://node3.testnet.hathor.network/api/',
  'https://node17.testnet.hathor.network/api/',
  'http://localhost:8080/',
];

export const DEFAULT_SERVER = DEFAULT_SERVERS[0];

// FIXME tx version should not be hardcoded
export const DEFAULT_TX_VERSION  = 1;

// Max value (inclusive) before having to use 8 bytes: 2147483648 ~= 2.14748e+09
export const MAX_OUTPUT_VALUE_32 = 2 ** 31 - 1

// Max level of the graph generated by the full node in the transaction detail screen
export const MAX_GRAPH_LEVEL = 1

// How many words will be used to validate the backup
export const WORDS_VALIDATION = 6

// Entropy for the new HD wallet words
export const HD_WALLET_ENTROPY = 256

// Network to generate addresses ('mainnet' or 'testnet')
export const NETWORK = process.env.HATHOR_WALLET_NETWORK || 'mainnet';

// Message to be written when user wants to reset all wallet data
export const CONFIRM_RESET_MESSAGE = 'I want to reset my wallet';

// Password regex pattern for validation
// - The string must contain at least 1 lowercase alphabetical character
// - The string must contain at least 1 uppercase alphabetical character
// - The string must contain at least 1 numeric character
// - The string must contain at least one special character (!@#$%^&)
// - The string must be eight characters or longer
export const PASSWORD_PATTERN = "(?=^.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$"

// Token masks

// First bit in the index byte indicates whether it's an authority output
export const TOKEN_INDEX_MASK = 0b01111111
export const TOKEN_AUTHORITY_MASK = 0b10000000

// Last bit indicates a token uid creation UTXO
export const TOKEN_CREATION_MASK = 0b00000001
// Second to last bit is mint authority
export const TOKEN_MINT_MASK = 0b00000010
// And next one is melt authority
export const TOKEN_MELT_MASK = 0b00000100

// Hathor token config
export const HATHOR_TOKEN_CONFIG = {'name': 'Hathor', 'symbol': 'HTR', 'uid': '00'};

// Hathor token default index
export const HATHOR_TOKEN_INDEX = 0;

// Local storage data useful for debugging purposes.
// WARNING: we cannot include any arbitrarily large fields (e.g. wallet:data) on Sentry request.
// WARNING: the request has a max size of 200kb and if it is bigger than this it'll be denied by Sentry.
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

// Quantity of blocks/txs to show per page in the dashboard
export const DASHBOARD_BLOCKS_COUNT = 6;
export const DASHBOARD_TX_COUNT = 6;

// Quantity of blocks/txs to show in their list page
export const TX_COUNT = 10;
