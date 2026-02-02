import nodemailer from "nodemailer";

export const sendEmail = ({ to, subject = "", text = "", html } = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  async function main() {
    const info = await transporter.sendMail({
      from: '"Social Media App "',
      to,
      subject,
      text,
      html,
    });
  }

  main().catch(console.error);
};
