import nodemailer from "nodemailer";
export const sendEmail = async ({ to, subject, html, attachments }) => {
  // sender
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //receiver
  const info = await transporter.sendMail({
    from: `"Ecommerce App 🛍" <${process.env.EMAIL}>`, // sender address
    to,
    subject,
    html,
    attachments,
  });
  return info.accepted.length < 1 ? false : true;
};
