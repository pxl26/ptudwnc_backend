const nodeMailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const myOAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);
myOAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

const sendMail = async (to, subject, htmlContent) => {

    try {
        let myAccessToken = '';
        myOAuth2Client.refreshAccessToken(function(err, tokens) {
            myAccessToken = tokens?.access_token;
            myOAuth2Client.credentials = {access_token: tokens?.access_token}
        });

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAUTH2',
                user: process.env.ADMIN_EMAIL_ADDRESS,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: myAccessToken,
            }
        })

        const mailOptions = {
            to: to,
            subject: subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error)
    }
};

module.exports = {
    sendMail: sendMail
}



