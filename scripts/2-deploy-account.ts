import { Address } from "locklift";

async function main() {
    const result = await locklift.giver.sendTo(
        new Address("0:86c4c21b15f373d77e80d6449358cfe59fc9a03e756052ac52258d8dd0ceb977"),
        locklift.utils.toNano(3),
    );
    console.log("result: ", result);
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });
