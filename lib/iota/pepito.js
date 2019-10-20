// const Iota = require('@iota/core');
// const Sign = require('@iota/signing');
// const Converter = require('@iota/converter');

const { createAccount } = require('@iota/account');
const { parseCDAMagnet } = reuqire('@iota/cda');
const seed = 'DQLMLJZGLOOJN9XDPAJPSKBBTZOAFELCQIVLTKNITULBNCRBPZINDTIBTYXHFJUPBSC9EJXTHPETHZAGP';

const provider = 'https://nodes.devnet.iota.org:443';

const account = createAccount({
    seed, provider
});


export default function send(magnet, amount) {
    account.getAvailableBalance().then(balance => console.log('Holder balance: ', balance))

    const { address, timeoutAt, multiUse, expectedAmount } = parseCDAMagnet(magnet);

    account.sendToCDA({
        address,
        timeoutAt,
        multiUse,
        expectedAmount,
        value: amount
    })
        .then(trytes => {
            console.log('Successfully prepared the transaction:', trytes)
        })
        .catch(err => {
            console.warn(err);
        })
}
