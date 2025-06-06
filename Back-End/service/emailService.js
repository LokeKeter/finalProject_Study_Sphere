const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(to, newPassword) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "איפוס סיסמה - StudySphere",
    text: `הסיסמה החדשה שלך היא: >>${newPassword}<<`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendPasswordResetEmail
};
