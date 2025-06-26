import { v4 as uuidv4 } from 'uuid';

export const generateVerificationToken = () => {
    return uuidv4(); // or use crypto.randomBytes(32).toString('hex') for stronger security
};