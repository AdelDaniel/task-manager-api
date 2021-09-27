const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const sendGridApiKey = process.env.TASK_MANAGER_KEY;

sgMail.setApiKey(sendGridApiKey);

const sendWelcomeEmail = (userName, userMail) => {
  const msg = {
    to: userMail,
    from: "adel.daniel.222@gmail.com", // Use the email address or domain you verified above
    subject: `Hi ${userName}.  Welcome In Task Manager`,
    html: "<strong>I wish to by a very good time with us </strong>",
  };
  //ES6
  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

const sendCancelationEmail = (userName, userMail) => {
  const msg = {
    to: userMail,
    from: "adel.daniel.222@gmail.com", // Use the email address or domain you verified above
    subject: `Oh No ${userName}.  We will miss you `,
    text: `hi ${userName} \n\n\t if there is any thing you don't like please feel free to tell us \n\n\tthanks`,
  };
  //ES6
  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
