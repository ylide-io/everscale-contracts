import { Address } from "locklift";

async function main() {
    const signer = (await locklift.keystore.getSigner("0"))!;

    const mailer = await locklift.factory.deployContract({
        contract: "YlideMailerV6",
        constructorParams: {},
        initParams: {
            nonce: 0,
            beneficiary: new Address("0:dc0e6248fa1f599fd1c2ac40d3ba2342d6eaaac4b19767063f939997dcbc66c2"),
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(3),
    });

    const broadcaster = await locklift.factory.deployContract({
        contract: "YlideMailerV6",
        constructorParams: {},
        initParams: {
            nonce: 0,
            beneficiary: new Address("0:86c4c21b15f373d77e80d6449358cfe59fc9a03e756052ac52258d8dd0ceb977"),
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(3),
    });

    const registry = await locklift.factory.deployContract({
        contract: "YlideRegistryV2",
        constructorParams: {},
        initParams: {
            nonce: 0,
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(3),
    });

    console.log(`Mailer deployed at: ${mailer.contract.address}`);
    console.log(`Broadcaster deployed at: ${broadcaster.contract.address}`);
    console.log(`Registry deployed at: ${registry.contract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });
