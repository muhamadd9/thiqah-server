import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
    // Check if real credentials are meant to be used, otherwise mock
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.log("⚠️  Email credentials not found. Mocking email send:");
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log("----------------------------------------");
        return true;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or configured host/port
        auth: {
            user,
            pass
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"Sasco Supervisor System" <${user}>`,
            to,
            subject,
            html
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
