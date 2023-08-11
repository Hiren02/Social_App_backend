const nodemailer = require("nodemailer");

let testAccount =  nodemailer.createTestAccount();
const createMailOptions = (sender, receivers, subject, body) => {
  let mailDetails = {
    from: sender,
    to: receivers,
    subject: subject,
    html: body,
    // html:html
  };
  return mailDetails;
};

async function sendEmail(mailOptions) {
  
  let EMAIL_CONFIG = {
    service: "gmail",
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      type:'PLAIN',
      // user: testAccount.user, // generated ethereal user
      // pass: testAccount.pass, // generated ethereal password
      user: process.env.EMAIL_SENDER_NAME, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  };
  let transporter = nodemailer.createTransport(EMAIL_CONFIG);
  transporter.sendMail(mailOptions, function(err, data) {
      if(err) {
          console.log('Error Occurs',err);
      } else {
          console.log('Email sent successfully',data);
      }
  });

  return transporter.sendMail(mailOptions);
}

function value(cn) {
  return cn.replace(/\${(\w+)}/, "$1");
}

async function send_mail_logic(mailUserDetails, templateDetails) {
  if (templateDetails) {
    let mailBody = templateDetails.mailBody;
    let idx = mailBody.match(new RegExp(/\${\w+}/g));
    if (idx && idx.length > 0) {
      idx.map((val, id) => {
        mailBody = mailBody.replace(/\${\w+}/, mailUserDetails[value(idx[id])]);
        return val;
      });
    }
    let returnedValue = await createMailOptions(
      process.env.EMAIL_SENDER_NAME,
      mailUserDetails.email,
      templateDetails.mailSubject,
      mailBody
    );
    console.log('returnedValue',returnedValue);
    
    return sendEmail(returnedValue);
  } else {
    return true;
  }
}

function SEND_MAIL(mailUserDetails, templateDetails) {
  return send_mail_logic(mailUserDetails, templateDetails);
}

module.exports = {
  SEND_MAIL,
  createMailOptions,
};
