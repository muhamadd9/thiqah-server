import { EventEmitter } from "node:events";
import { customAlphabet } from "nanoid";
import { sendEmail } from "../email/sendEmail.js";
import userModel from "../../DB/model/User.model.js";
import { hashPassword } from "../security/hash.js";

const emailEvent = new EventEmitter();

emailEvent.on("forgetPassword", async (data) => {
  const { email, userId } = data;
  //  email,
  // subject: "Reset Password",
  // html: `<p>Click <a href="${process.env.CLIENT_URL}/reset-password/${user._id}">here</a> to reset password</p>`,

  console.log("email sending", process.env.CLIENT_URL);
  await sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<p>Click <a href="${process.env.CLIENT_URL}/reset-password/${userId}">here</a> to reset password</p>`,
  });

  console.log("email sent");
});

export default emailEvent;
