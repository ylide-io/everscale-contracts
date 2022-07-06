const getRandomNonce = () => (Math.random() * 64000) | 0;

async function main() {
    const Mailer = await locklift.factory.getContract("YlideMailerV2");
    const [keyPair] = await locklift.keys.getKeyPairs();

    const sample = await locklift.giver.deployContract({
        contract: Mailer,
        constructorParams: {},
        initParams: {},
        keyPair,
    });

    console.log(`Mailer deployed at: ${sample.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });