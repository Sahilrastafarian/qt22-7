const { MAILJET_USER_KEY, MAILJET_SECRET_KEY } = require("../config.js");

const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    MAILJET_USER_KEY,
    MAILJET_SECRET_KEY,
);


module.exports = function iSendTheMail(toEmail, pdfData)
{
    console.log("mail sending");
  const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "sahil109007@gmail.com",
                Name: "Mailjet Pilot"
              },
              To: [
                {
                  Email: toEmail,
                  Name: "passenger 1"
                }
              ],
              Subject: "Your email flight plan!",
              TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
              Attachments: [
                {
                  ContentType: "application/pdf",
                  FileName: "recentChat.pdf",
                  Base64Content: pdfData,
                },
              ],
        }]
      })

request
    .then((result) => {
        console.log(result.body)
    })
    .catch((err) => {
        console.log(err)
    })
}