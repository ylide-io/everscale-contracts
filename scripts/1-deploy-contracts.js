const getRandomNonce = () => (Math.random() * 64000) | 0;

async function main() {
    const Mailer = await locklift.factory.getContract("YlideMailerV3");
    const Registry = await locklift.factory.getContract("YlideRegistryV1");

    const [keyPair] = await locklift.keys.getKeyPairs();

    const mailer = await locklift.giver.deployContract({
        contract: Mailer,
        constructorParams: {},
        initParams: {},
        keyPair,
    });

    const registry = await locklift.giver.deployContract({
        contract: Registry,
        constructorParams: {},
        initParams: {},
        keyPair,
    });

    console.log(`Mailer deployed at: ${mailer.address}`);
    console.log(`Registry deployed at: ${registry.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });