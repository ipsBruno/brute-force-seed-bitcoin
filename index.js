/*
* Brute Force Seeds in Blockchain
* When find a seed will save in the logs
* It scan about 20 seeds/sec
* Each seed can have hundreds (or more) addresses
* email@brunodasilva.com
*/


var bitcoin = require('bitcoinjs-lib')
var bip39 = require('bip39')
var bip32 = require('bip32')
var blockchain = require('blockchain.info/blockexplorer').usingNetwork(0)
var crypto = require('crypto')
var fs = require('fs')


var DerivationPath =  "m/44'/0'/0'"

setInterval(function() {
  var xSeedPrv = []
  var xPubKeys = []
  for(var i = 0; i < 20; i++) {
    xSeedPrv[i] = bip39.entropyToMnemonic(crypto.randomBytes(16).toString('hex'))
    xPubKeys[i] = getPubKeyFromRoot(bip32.fromSeed(bip39.mnemonicToSeed(xSeedPrv[i] , "")), DerivationPath)
  }
  blockchain.getMultiAddress(xPubKeys, {}).then(function(valor) {
    if(valor && valor.wallet && valor.wallet.n_tx > 0) {
      fs.writeFileSync("logs.txt", xSeedPrv.join("\r\n"))
    }
  }).catch(function(err) {
    console.log(err)
  })
}, 1000)



/*
* Generate PublicKey from Bip32Root/DerivationPath
* Original Function by Ian Coleman
*/
function getPubKeyFromRoot(bip32RootKey, path) {
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
