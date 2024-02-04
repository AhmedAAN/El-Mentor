import Jwt from "jsonwebtoken";

export default async function newAccessToken(
  load: object,
  secretKey: string,
  ops: object
) {
  const token = await Jwt.sign(load, secretKey, ops);

  return token;
}
