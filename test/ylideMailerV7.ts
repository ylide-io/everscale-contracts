import { expect } from 'chai';
import { Account } from 'everscale-standalone-client';
import { Contract, Signer } from 'locklift';
import { FactorySource } from '../build/factorySource';
import { getAccounts, getRandomAddress, getRandomBytes } from '../scripts/utils';

describe('Test YlideMailerV7 contract', async function () {
	let mailer: Contract<FactorySource['YlideMailerV7']>;
	let signer: Signer;
	let owner: Account;
	let user1: Account;

	const uniqueId = 123;
	const recipients = [getRandomAddress(), getRandomAddress()];
	const keys = [getRandomBytes(), getRandomBytes()];
	const content = getRandomBytes(56);

	before(async () => {
		signer = (await locklift.keystore.getSigner('0'))!;
		[owner, user1] = await getAccounts();
	});

	describe('Contracts', async function () {
		it('Load contract factory', function () {
			const sampleData = locklift.factory.getContractArtifacts('YlideMailerV7');

			expect(sampleData.code).not.to.equal(undefined, 'Code should be available');
			expect(sampleData.abi).not.to.equal(undefined, 'ABI should be available');
			expect(sampleData.tvc).not.to.equal(undefined, 'tvc should be available');
		});

		it('Deploy contract', async function () {
			const { contract } = await locklift.factory.deployContract({
				contract: 'YlideMailerV7',
				publicKey: signer.publicKey,
				initParams: {
					nonce: 0,
					beneficiary: recipients[0],
				},
				constructorParams: {
					_owner: owner.address,
				},
				value: locklift.utils.toNano(2),
			});
			mailer = contract;

			expect(await locklift.provider.getBalance(mailer.address).then(balance => Number(balance))).to.be.above(0);
		});

		it('sendSmallMail', async function () {
			const { parentTransaction, childTransaction } = await mailer.methods
				.sendSmallMail({
					uniqueId,
					recipient: recipients[0],
					key: keys[0],
					content,
				})
				.sendWithResult({
					from: user1.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);

			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(3);
		});

		it('sendBulkMail', async function () {
			const { parentTransaction, childTransaction } = await mailer.methods
				.sendBulkMail({
					uniqueId,
					recipients: recipients,
					keys,
					content,
				})
				.sendWithResult({
					from: user1.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);

			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(4);
		});

		it('addRecipients', async function () {
			const { parentTransaction, childTransaction } = await mailer.methods
				.addRecipients({
					uniqueId,
					recipients: recipients,
					keys,
					initTime: 123,
				})
				.sendWithResult({
					from: user1.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);

			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(3);
		});

		it('creates broadcast feed', async function () {
			// not owner of contract cannot create broadcast feed
			const { parentTransaction: pT, childTransaction: cT } = await mailer.methods
				.createBroadcastFeed({
					uniqueId,
				})
				.sendWithResult({
					from: user1.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});
			expect(pT.aborted).equal(false);
			expect(cT.aborted).equal(true);

			// owner creates broadcast feed
			await mailer.methods
				.createBroadcastFeed({
					uniqueId,
				})
				.sendWithResult({
					from: owner.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			// user cannot send message to non existing feed id
			const { parentTransaction: pT2, childTransaction: cT2 } = await mailer.methods
				.broadcastMail({
					feedId: 123,
					uniqueId,
					content,
				})
				.sendWithResult({
					from: user1.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});
			expect(pT2.aborted).equal(false);
			expect(cT2.aborted).equal(true);

			// user can send message to existing feed id
			const { feedIds } = await mailer.methods.feedIds().call();
			const feedExists = await mailer.methods.doesFeedExist({ feedId: feedIds[0] }).call();
			expect(feedExists.value0).equal(true);
			const { parentTransaction, childTransaction } = await mailer.methods
				.broadcastMail({
					feedId: feedIds[0],
					uniqueId,
					content,
				})
				.sendWithResult({
					from: user1.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});
			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);
			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(3);
		});
	});
});
