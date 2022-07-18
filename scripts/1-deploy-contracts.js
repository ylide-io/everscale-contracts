const getRandomNonce = () => (Math.random() * 64000) | 0;

async function main() {
    const Mailer = await locklift.factory.getContract("YlideMailerV4");
    const Registry = await locklift.factory.getContract("YlideRegistryV1");

    const [keyPair] = await locklift.keys.getKeyPairs();

    const mailer = await locklift.giver.deployContract({
        contract: Mailer,
        constructorParams: {},
        initParams: {
            beneficiary: "0:dc0e6248fa1f599fd1c2ac40d3ba2342d6eaaac4b19767063f939997dcbc66c2",
            owner: "0:86c4c21b15f373d77e80d6449358cfe59fc9a03e756052ac52258d8dd0ceb977",
        },
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