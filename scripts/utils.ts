import crypto from 'crypto';
import { Address } from 'locklift';

export const getRandomBytes = (length = 32) => crypto.randomBytes(length).toString('hex');
export const getRandomAddress = () => new Address('0:' + crypto.randomBytes(32).toString('hex'));
