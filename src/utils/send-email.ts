import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();
const email: string = String(process.env.SENDER_EMAIL);
const password: string = String(process.env.SENDER_PASSWORD);
console.log("email = " + process.env.SENDER_EMAIL);
console.log("PASSWORD = " + process.env.SENDER_PASSWORD);
export async function forgetEmail(userEmail: string, subject: number) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email, //your email and password of the owner of website aka **sender** from .env
        pass: password, //password after two step verification from .env
      },
    });
    const mailOptions = {
      from: email, //sender from .env
      to: userEmail,
      subject: "Auth code",
      html: `<h1> Your authentication code is : ${subject} </h1>`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("info response = " + info.response);
  } catch (err) {
    console.log("Error in Email Service : ", err);
  }
}
