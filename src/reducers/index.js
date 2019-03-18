import wallet from '../utils/wallet';
import { GAP_LIMIT, HATHOR_TOKEN_CONFIG, NETWORK } from '../constants';
import { HDPublicKey, Address } from 'bitcore-lib';

const initialState = {
/*
 * 'historyTransactions':
 *   {'tx_id': tx_data}
 */
  historyTransactions: {},
  // Address to be used and is shown in the screen
  lastSharedAddress: null,
  // Index of the address to be used
  lastSharedIndex: null,
  // If the backend API version is allowed for this admin (boolean)
  isVersionAllowed: undefined,
  // If the connection with the server is online
  isOnline: undefined,
  // Config of the last request that failed
  lastFailedRequest: undefined,
  // Wallet password
  password: undefined,
  // Wallet pin
  pin: undefined,
  // Wallet words
  words: undefined,
  // Tokens already saved: array of objects
  // {'name', 'symbol', 'uid'}
  tokens: [HATHOR_TOKEN_CONFIG],
  // Token selected (by default is HATHOR)
  selectedToken: HATHOR_TOKEN_CONFIG.uid,
  // List of all tokens seen in transactions
  allTokens: new Set(),
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'history_update':
      const payload = action.payload.data;
      const historyTransactions = Object.assign({}, state.historyTransactions);
      const allTokens = new Set(state.allTokens);
      const dataJson = wallet.getWalletData();

      let maxIndex = -1;
      let lastUsedAddress = null;
      for (const tx of payload) {
        historyTransactions[tx.tx_id] = tx

        for (const txin of tx.inputs) {
          const key = dataJson.keys[txin.decoded.address];
          if (key) {
            allTokens.add(txin.token);
            if (key.index > maxIndex) {
              maxIndex = key.index;
              lastUsedAddress = txin.decoded.address
            }
          }
        }
        for (const txout of tx.outputs) {
          const key = dataJson.keys[txout.decoded.address];
          if (key) {
            allTokens.add(txout.token);
            if (key.index > maxIndex) {
              maxIndex = key.index;
              lastUsedAddress = txout.decoded.address
            }
          }
        }
      }

      const storageLastUsedIndex = localStorage.getItem('wallet:lastUsedIndex');
      const lastUsedIndex = storageLastUsedIndex !== null ? parseInt(storageLastUsedIndex, 10) : -1;

      const storageLastSharedIndex = localStorage.getItem('wallet:lastSharedIndex');
      const lastSharedIndex = storageLastSharedIndex !== null ? parseInt(storageLastSharedIndex, 10) : -1;

      let newSharedAddress = null;
      let newSharedIndex = -1;

      if (maxIndex > lastUsedIndex && lastUsedAddress !== null) {
        // Setting last used index and last shared index
        wallet.setLastUsedIndex(lastUsedAddress);
        // Setting last shared address, if necessary
        const candidateIndex = maxIndex + 1;
        if (candidateIndex > lastSharedIndex) {
          const xpub = HDPublicKey(dataJson.xpubkey);
          const key = xpub.derive(candidateIndex);
          const address = Address(key.publicKey, NETWORK).toString();
          newSharedIndex = candidateIndex;
          newSharedAddress = address;
          wallet.updateAddress(address, candidateIndex, false);
        }
      }

      const lastGeneratedIndex = wallet.getLastGeneratedIndex();
      // Just in the case where there is no element in all data
      maxIndex = Math.max(maxIndex, 0);
      if (maxIndex + GAP_LIMIT > lastGeneratedIndex) {
        const startIndex = lastGeneratedIndex + 1;
        const count = maxIndex + GAP_LIMIT - lastGeneratedIndex;
        const promise = wallet.loadAddressHistory(startIndex, count);
        promise.then(() => {
          if (action.payload.resolve) {
            action.payload.resolve();
          }
        })
      } else {
        if (action.payload.resolve) {
          action.payload.resolve();
        }
      }

      const newLastSharedAddress = newSharedAddress === null ? state.lastSharedAddress : newSharedAddress;
      const newLastSharedIndex = newSharedIndex === null ? state.lastSharedIndex : newSharedIndex;
      wallet.saveAddressHistory(historyTransactions, allTokens);

      return Object.assign({}, state, {historyTransactions, allTokens, lastSharedIndex: newLastSharedIndex, lastSharedAddress: newLastSharedAddress});

    case 'shared_address':
      return Object.assign({}, state, {lastSharedAddress: action.payload.lastSharedAddress, lastSharedIndex: action.payload.lastSharedIndex});
    case 'is_version_allowed_update':
      return Object.assign({}, state, {isVersionAllowed: action.payload.allowed});
    case 'is_online_update':
      return Object.assign({}, state, {isOnline: action.payload.isOnline});
    case 'reload_data':
      return Object.assign({}, state, action.payload);
    case 'clean_data':
      return Object.assign({}, initialState, {isVersionAllowed: state.isVersionAllowed});
    case 'last_failed_request':
      return Object.assign({}, state, {lastFailedRequest: action.payload});
    case 'update_password':
      return Object.assign({}, state, {password: action.payload});
    case 'update_pin':
      return Object.assign({}, state, {pin: action.payload});
    case 'update_words':
      return Object.assign({}, state, {words: action.payload});
    case 'select_token':
      return Object.assign({}, state, {selectedToken: action.payload});
    case 'new_token':
      return Object.assign({}, state, {selectedToken: action.payload.uid, tokens: [...state.tokens, action.payload]});
    default:
      return state;
  }
};

export default rootReducer;