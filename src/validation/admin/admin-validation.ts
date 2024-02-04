import { collection } from "../../models/connection";
import hash from "../../utils/hashing-pssword";

export default async function adminValidation(requestHandler: any) {
  const users = collection("users");
  const name: string = requestHandler.input("userName");
  const email: string = requestHandler.input("email");
  const password: string = requestHandler.input("password");
  const confirmPassword: string = requestHandler.input("confirmPassword");
  const isAdmin = true;
  const findEmail = await users.findOne({ email: email });
  const validRegex =
    /^[a-zA-Z0-9.!#$%^&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9]+)*$/;
  if (!email.match(validRegex)) {
    return "Please enter a valid email";
  } else if (findEmail) {
    return "Email already exists";
  } else if (password !== confirmPassword && password.length > 8) {
    return "Password is incorrect";
  } else {
    const finalPass = await hash(password);
     await users.insertOne({
      userName:name,
      email,
      password: finalPass,
      isAdmin,
    });
    return true;
  }

}
