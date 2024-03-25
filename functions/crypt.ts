import * as crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || '';

const key = crypto.createHash('sha512').update(SECRET_KEY).digest('hex').substring(0, 32);

export function encrypt(string: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(string, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
  };
}

export function decrypt(ciphertext: string, iv: string) {
  const ivBuffer = Buffer.from(iv, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);

  return decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8');
}
