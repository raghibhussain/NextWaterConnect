import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// ✅ Hash password before storing in database
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ✅ Verify password during login
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}