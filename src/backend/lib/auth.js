import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-finance-super-secret-key-do-not-use-in-prod';
const secretKey = new TextEncoder().encode(JWT_SECRET);


export async function verifyAuth(token) {
  try {
    const verified = await jwtVerify(token, secretKey);
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function signAuth(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}
