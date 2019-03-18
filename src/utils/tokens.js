import transaction from './transaction';
import { crypto, util } from 'bitcore-lib';
import store from '../store/index';
import walletApi from '../api/wallet';
import { newToken } from '../actions/index';
import buffer from 'buffer';
import { HATHOR_TOKEN_CONFIG, TOKEN_CREATION_MASK, TOKEN_MINT_MASK, TOKEN_MELT_MASK, DECIMAL_PLACES } from '../constants';


/*
 * @namespace Tokens
 */

const tokens = {
  /*
   * Create a token UID from the tx_id and index that the tx is spending to create the token
   *
   * @param {string} txID Transaction id in hexadecimal of the output that is being spent when creating the token
   * @param {number} index Index of the output that is being spent when creating the token
   *
   * @return {Buffer} UID of the token in bytes
   *
   * @memberof Tokens
   * @inner
   */
  getTokenUID(txID, index) {
    let arr = [];
    arr.push(util.buffer.hexToBuffer(txID));
    arr.push(transaction.intToBytes(index, 1));
    return crypto.Hash.sha256(util.buffer.concat(arr));
  },

  /*
   * Add a new token to the localStorage and redux
   *
   * @param {string} uid Token uid
   * @param {string} name Token name
   * @param {string} symbol Token synbol
   *
   * @memberof Tokens
   * @inner
   */
  addToken(uid, name, symbol) {
    const newConfig = {'name': name, 'symbol': symbol, 'uid': uid};
    let tokens = this.getTokens();
    tokens.push(newConfig);
    this.saveToStorage(tokens);
    store.dispatch(newToken(newConfig));
  },

  /*
   * Validation token by configuration string
   * Check if string is valid and, if uid is passed, check also if uid matches
   *
   * @param {string} config Token configuration string
   * @param {string} uid Uid to check if matches with uid from config (optional)
   *
   * @return {Object} {success: boolean, message: in case of failure, tokenData: object with token data in case of success}
   *
   * @memberof Tokens
   * @inner
   */
  validateTokenToAddByConfigurationString(config, uid) {
    const tokenData = this.getTokenFromConfigurationString(config);
    if (tokenData === null) {
      return {success: false, message: 'Invalid configuration string'};
    }
    if (uid && uid !== tokenData.uid) {
      return {success: false, message: `Configuration string uid does not match: ${uid} != ${tokenData.uid}`};
    }

    const validation = this.validateTokenToAddByUid(tokenData.uid);
    if (validation.success) {
      return {success: true, tokenData: tokenData};
    } else {
      return validation;
    }
  },

  /*
   * Validation token by uid. Check if already exist
   *
   * @param {string} uid Uid to check for existence
   *
   * @return {Object} {success: boolean, message: in case of failure}
   *
   * @memberof Tokens
   * @inner
   */
  validateTokenToAddByUid(uid) {
    const existedToken = this.tokenExists(uid);
    if (existedToken) {
      return {success: false, message: `You already have this token: ${uid} (${existedToken.name})`};
    }

    return {success: true};
  },

  /*
   * Returns the saved tokens in localStorage
   *
   * @return {Object} Array of objects ({'name', 'symbol', 'uid'}) of saved tokens
   *
   * @memberof Tokens
   * @inner
   */
  getTokens() {
    let dataToken = localStorage.getItem('wallet:tokens');
    if (dataToken) {
      dataToken = JSON.parse(dataToken);
    } else {
      dataToken = [HATHOR_TOKEN_CONFIG];
    }
    return dataToken;
  },

  /*
   * Updates the saved tokens in localStorage
   *
   * @param {Object} Array of objects ({'name', 'symbol', 'uid'}) with new tokens
   *
   * @memberof Tokens
   * @inner
   *
   */
  saveToStorage(newTokens) {
    localStorage.setItem('wallet:tokens', JSON.stringify(newTokens));
  },

  /*
   * Returns token configuration string
   *
   * @param {string} uid Token uid
   * @param {string} name Token name
   * @param {string} symbol Token symbol
   *
   * @return {string} base64 of the configuration
   *
   * @memberof Tokens
   * @inner
   *
   */
  getConfigurationString(uid, name, symbol) {
    const config = [uid, name, symbol];
    // Base64 of array stringified
    return buffer.Buffer.from(JSON.stringify(config)).toString('base64')
  },

  /*
   * Returns token from configuration string
   *
   * @param {string} config Configuration string in base64
   *
   * @return {Object} token {'uid', 'name', 'symbol'} or null in case config is invalid
   *
   * @memberof Tokens
   * @inner
   *
   */
  getTokenFromConfigurationString(config) {
    let data = null;
    try {
      const stringified = buffer.Buffer.from(config, 'base64').toString();
      data = JSON.parse(stringified);
      if (data.length !== 3) {
        return null;
      }
    } catch(e) {
      return null;
    }

    return {'uid': data[0], 'name': data[1], 'symbol': data[2]};
  },

  /*
   * Indicates if a token with this uid was already added in the wallet
   *
   * @param {string} uid UID of the token to search
   *
   * @return {Object|null} Token if uid already exists, else null
   *
   * @memberof Tokens
   * @inner
   */
  tokenExists(uid) {
    const tokens = this.getTokens();
    for (const token of tokens) {
      if (token.uid === uid) {
        return token;
      }
    }
    return null;
  },

  /*
   * Create the tx for the new token in the backend and creates a new mint and melt outputs to be used in the future
   *
   * @param {Object} input {'tx_id', 'index', 'token'} Hathor input to be spent to generate the token
   * @param {Object} output {'address', 'value', 'tokenData'} Hathor output to get the change of the input that generated the token
   * @param {string} address Address to receive the amount of the generated token
   * @param {string} name Name of the new token
   * @param {string} symbol Symbol of the new token
   * @param {number} mintAmount Amount of the new token that will be minted
   * @param {string} pin Pin to generate new addresses, if necessary
   *
   * @return {Promise} Promise that resolves when token is created or an error from the backend arrives
   *
   * @memberof Tokens
   * @inner
   */
  createToken(input, output, address, name, symbol, mintAmount, pin) {
    // Create authority output
    // First the tokens masks that will be the value for the authority output
    const tokenMasks = TOKEN_CREATION_MASK | TOKEN_MINT_MASK | TOKEN_MELT_MASK;
    // Authority output token data
    const tokenData = 0b10000001;
    // Create token uid
    const tokenUID = this.getTokenUID(input.tx_id, input.index);
    const authorityOutput = {'address': address, 'value': tokenMasks, 'tokenData': tokenData};
    // Create tx data
    let txData = {'inputs': [input], 'outputs': [authorityOutput, output], 'tokens': [tokenUID]};
    // Get data to sign
    const dataToSign = transaction.dataToSign(txData);
    // Sign tx
    txData = transaction.signTx(txData, dataToSign, pin);
    // Assemble tx and send to backend
    transaction.completeTx(txData);
    const txBytes = transaction.txToBytes(txData);
    const txHex = util.buffer.bufferToHex(txBytes);
    const promise = new Promise((resolve, reject) => {
      walletApi.sendTokens(txHex, (response) => {
        if (response.success) {
          // Save in localStorage and redux new token configuration
          this.addToken(response.tx.tokens[0], name, symbol);
          const mintPromise = this.mintTokens(response.tx.hash, response.tx.tokens[0], address, mintAmount, pin)
          mintPromise.then(() => {
            resolve();
          }, (e) => {
            reject();
          });
        } else {
          reject(response.message);
        }
      }, (e) => {
        // Error in request
        console.log(e);
        reject(e.message);
      });
    });
    return promise;
  },

  /*
   * Mint new tokens
   *
   * @param {string} txId Hash of the transaction to be used to mint tokens
   * @param {string} token Token uid to be minted
   * @param {string} address Address to receive the amount of the generated token
   * @param {number} amount Amount of the new token that will be minted
   * @param {string} pin Pin to generate new addresses, if necessary
   *
   * @return {Promise} Promise that resolves when token is minted or an error from the backend arrives
   *
   * @memberof Tokens
   * @inner
   */
  mintTokens(txId, token, address, amount, pin) {
    // Authority output token data
    const tokenData = 0b10000001;
    // Now we will mint the tokens
    const newInput = {'tx_id': txId, 'index': 0, 'token': token, 'address': address};
    // Output1: Mint token amount
    const tokenOutput1 = {'address': address, 'value': parseInt(amount*(10**DECIMAL_PLACES), 10), 'tokenData': 1};
    // Output2: new mint authority
    const tokenOutput2 = {'address': address, 'value': TOKEN_MINT_MASK, 'tokenData': tokenData};
    // Output3: new melt authority
    const tokenOutput3 = {'address': address, 'value': TOKEN_MELT_MASK, 'tokenData': tokenData};
    // Create new data
    let newTxData = {'inputs': [newInput], 'outputs': [tokenOutput1, tokenOutput2, tokenOutput3], 'tokens': [token]};
    // Get new data to sign
    const newDataToSign = transaction.dataToSign(newTxData);
    // Sign mint tx
    newTxData = transaction.signTx(newTxData, newDataToSign, pin);
    // Assemble tx and send to backend
    transaction.completeTx(newTxData);
    const newTxBytes = transaction.txToBytes(newTxData);
    const newTxHex = util.buffer.bufferToHex(newTxBytes);
    const promise = new Promise((resolve, reject) => {
      walletApi.sendTokens(newTxHex, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(response.message);
        }
      }, (e) => {
        // Error in request
        reject(e.message);
      });
    });
    return promise;
  },

  /*
   * Filter an array of tokens removing one element
   *
   * @param {Object} tokens Array of token configs
   * @param {Object} toRemove Config of the token to be removed
   *
   * @return {Object} Array of token configs filtered
   *
   * @memberof Tokens
   * @inner
   */
  filterTokens(tokens, toRemove) {
    return tokens.filter((token) => token.uid !== toRemove.uid);
  },

  /*
   * Gets the token index to be added to the tokenData in the output from tx
   *
   * @param {Object} tokens Array of token configs
   * @param {Object} uid Token uid to return the index
   *
   * @return {number} Index of token to be set as tokenData in output tx
   *
   * @memberof Tokens
   * @inner
   */
  getTokenIndex(tokens, uid) {
    // If token is Hathor, index is always 0
    // Otherwise, it is always the array index + 1
    if (uid === HATHOR_TOKEN_CONFIG.uid) {
      return 0;
    } else {
      // This code is duplicate. We can move it to `utils/wallet`.
      const tokensWithoutHathor = this.filterTokens(tokens, HATHOR_TOKEN_CONFIG);
      const myIndex = tokensWithoutHathor.findIndex((token) => token.uid === uid);
      return myIndex + 1;
    }
  }
}

export default tokens;