const range = (n) => [...Array(n).keys()];

async function main() {
    const result = await locklift.giver.giver.run({
        method: "sendGrams",
        params: {
            dest: "0:86c4c21b15f373d77e80d6449358cfe59fc9a03e756052ac52258d8dd0ceb977",
            amount: locklift.utils.convertCrystal(100, "nano"),
        },
    });
    console.log("result: ", result);
    // const Account = await locklift.factory.getAccount("Wallet");
    // const keyPairs = await locklift.keys.getKeyPairs();

    // const balance = 100;

    // let account = await locklift.giver.deployContract({
    //         contract: Account,
    //         constructorParams: {},
    //         initParams: {
    //             _randomNonce: (Math.random() * 6400) | 0,
    //         },
    //         keyPair: keyPairs[0],
    //     },
    //     locklift.utils.convertCrystal(balance, "nano")
    // );
    // const name = `Account${key_number + 1}`;
    // console.log("keyPairs: ", keyPairs);
    // console.log(`${name}: ${account.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });