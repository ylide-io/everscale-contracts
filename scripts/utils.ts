import crypto from 'crypto';
import { Address, WalletTypes } from 'locklift';

export const getRandomBytes = (length = 32) => crypto.randomBytes(length).toString('hex');
export const getRandomAddress = () => new Address('0:' + crypto.randomBytes(32).toString('hex'));

export const getAccounts = (number = 10) => {
	return Promise.all(
		new Array(number).fill(1).map((_, index) =>
			locklift.keystore
				.getSigner(index.toString())
				.then(signer =>
					locklift.factory.accounts.addNewAccount({
						type: WalletTypes.WalletV3,
						publicKey: signer!.publicKey,
						value: locklift.utils.toNano(100),
					}),
				)
				.then(r => r.account),
		),
	);
};
