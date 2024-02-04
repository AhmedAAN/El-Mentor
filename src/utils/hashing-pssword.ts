import bcrypt from "bcrypt";

export default async function hash(password: any) {
  const hash: string = await bcrypt.hash(password, 10);
  return hash;
}
