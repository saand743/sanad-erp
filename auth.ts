0,0 @@
import { NextApiRequest } from 'next';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers'; // For use in Server Components/Actions

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in environment variables.');
}
const key = new TextEncoder().encode(secretKey);

/**
 * Verifies the JWT from the request cookies and returns the payload.
 * This is the actual implementation for `getUserIdFromRequest`.
 * @param req The Next.js API request object.
 * @returns The user ID from the token payload, or null if invalid/not found.
 */
export async function getUserIdFromRequest(req: NextApiRequest): Promise<string | null> {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    // Assuming your token payload has a `sub` (subject) claim with the user ID.
    return payload.sub ?? null;
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return null;
  }
}

/**
 * Encrypts a payload and returns a JWT.
 * Use this function when a user logs in.
 * @param payload The data to store in the token (e.g., { sub: userId, role: 'admin' }).
 * @returns The signed JWT string.
 */
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Token expires in 1 day
    .sign(key);
}

/**
 * A helper to set the token cookie in an API route response.
 * @param res The Next.js API response object.
 * @param token The JWT to set in the cookie.
 */
export function setTokenCookie(res: import('next').NextApiResponse, token: string) {
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`);
}