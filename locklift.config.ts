import { LockliftConfig } from 'locklift';
import { FactorySource } from './build/factorySource';
import dotenv from 'dotenv';
dotenv.config();

declare global {
	const locklift: import('locklift').Locklift<FactorySource>;
}

const LOCAL_NETWORK_ENDPOINT = process.env.NETWORK_ENDPOINT || 'http://localhost/graphql';
const DEV_NET_NETWORK_ENDPOINT = process.env.DEV_NET_NETWORK_ENDPOINT || 'https://devnet-sandbox.evercloud.dev/graphql';

const VENOM_TESTNET_ENDPOINT = process.env.VENOM_TESTNET_ENDPOINT || 'https://jrpc-testnet.venom.foundation/rpc';
const VENOM_TESTNET_TRACE_ENDPOINT =
	process.env.VENOM_TESTNET_TRACE_ENDPOINT || 'https://gql-testnet.venom.foundation/graphql';

// Create your own link on https://dashboard.evercloud.dev/
const MAIN_NET_NETWORK_ENDPOINT = process.env.MAIN_NET_NETWORK_ENDPOINT || 'https://mainnet.evercloud.dev/XXX/graphql';

const config: LockliftConfig = {
	compiler: {
		version: '0.62.0',
	},
	linker: {
		version: '0.15.48',
	},
	networks: {
		// You can use TON labs graphql endpoints or local node
		local: {
			// Specify connection settings for https://github.com/broxus/everscale-standalone-client/
			connection: {
				id: 1,
				group: 'localnet',
				type: 'graphql',
				data: {
					endpoints: [LOCAL_NETWORK_ENDPOINT],
					latencyDetectionInterval: 1000,
					local: true,
				},
			},
			// This giver is default local-node giverV2
			giver: {
				// Check if you need provide custom giver
				address: process.env.LOCAL_GIVER_ADDRESS || '',
				key: process.env.LOCAL_GIVER_KEY || '',
			},
			tracing: {
				endpoint: LOCAL_NETWORK_ENDPOINT,
			},
			keys: {
				// Use everdev to generate your phrase
				// !!! Never commit it in your repos !!!
				phrase: process.env.LOCAL_KEYS_PHRASE,
				amount: 20,
			},
		},
	},
	mocha: {
		timeout: 2000000,
	},
};

export default config;
