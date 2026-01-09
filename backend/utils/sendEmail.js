const axios = require('axios');

const sendEmail = async (options) => {
    if (!process.env.BREVO_API_KEY) {
        console.error("FATAL ERROR: BREVO_API_KEY is not defined in .env");
        throw new Error("Email service not configured.");
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@brevo.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Loopio Support';

    console.log(`Attempting to send email via Brevo API...`);
    console.log(`From: ${senderName} <${senderEmail}>`);
    console.log(`To: ${options.email}`);

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [
                    {
                        email: options.email,
                        name: options.name // Optional, if available
                    }
                ],
                subject: options.subject,
                htmlContent: options.message.replace(/\n/g, '<br>'),
                textContent: options.message
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY, // V3 uses 'api-key', typically
                    'content-type': 'application/json'
                }
            }
        );

        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Brevo API Error:', JSON.stringify(error.response.data, null, 2));
            throw new Error(`Email sending failed: ${error.response.data.message || 'Unknown Brevo error'}`);
        } else {
            console.error('Network/Client Error:', error.message);
            throw new Error('Email could not be sent due to network or client error');
        }
    }
};

module.exports = sendEmail;
