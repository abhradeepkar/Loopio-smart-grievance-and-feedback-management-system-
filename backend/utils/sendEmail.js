const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        const data = await resend.emails.send({
            from: 'Loopio Support <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            html: options.message.replace(/\n/g, '<br>'),
            text: options.message
        });

        console.log('Email sent successfully:', data);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
