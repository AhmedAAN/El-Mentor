import bcrypt from "bcrypt";

export default async function verifyPassword(
  password: string,
  finalPassword: string
) {
  const result = await bcrypt.compare(password, finalPassword);
  if (result) {
    return true;
  } else {
    return false;
  }
}
