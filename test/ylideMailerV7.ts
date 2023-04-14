import { expect } from 'chai';
import { Account } from 'everscale-standalone-client';
import { Contract, Signer, WalletTypes } from 'locklift';
import { FactorySource } from '../build/factorySource';
import { getRandomAddress, getRandomBytes } from '../scripts/utils';

describe('Test YlideMailerV7 contract', async function () {
	let mailer: Contract<FactorySource['YlideMailerV7']>;
	let signer: Signer;
	let user: Account;

	const uniqueId = 123;
	const recipients = [getRandomAddress(), getRandomAddress()];
	const keys = [getRandomBytes(), getRandomBytes()];
	const content = getRandomBytes(56);

	before(async () => {
		signer = (await locklift.keystore.getSigner('0'))!;
		const r = await locklift.factory.accounts.addNewAccount({
			type: WalletTypes.WalletV3,
			publicKey: signer.publicKey,
			value: locklift.utils.toNano(100),
		});
		user = r.account;
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
				constructorParams: {},
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
					from: user.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);

			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(4);
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
					from: user.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);

			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(5);
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
					from: user.address,
					amount: locklift.utils.toNano(10),
					bounce: false,
				});

			expect(parentTransaction.aborted).equal(false);
			expect(childTransaction.aborted).equal(false);

			expect(parentTransaction.outMessages.length).equal(1);
			expect(childTransaction.outMessages.length).equal(4);
		});
	});
});
