const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

// Stripe test & live secret keys
const testKey = process.env.testkey;
const liveKey = process.env.livekey;

// nodemailer email & password
const email = process.env.email;
const emailPassword = process.env.password;

var stripe = require("stripe")(testKey);
var nodemailer = require("nodemailer");

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/post", function(req, res) {
  // retrieving order from client via axios XMLHttp request
  const newOrder = req.body;
  // client's email for use with nodemail
  const customerEmail = newOrder.body.token.email;
  // client's order
  const baskets = newOrder.body.baskets;

  const cumstomerName = newOrder.body.args.billing_name;

  // const util = require("util");
  // console.log(util.inspect(baskets, false, null, true));

  // console.log(newOrder.body.token.id);

  // email can be added for stripe auto receipts:
  // receipt_email:

  // Token is created using Stripe Checkout
  // Get the payment token ID submitted by the form:
  const token = newOrder.body.token.id;

  (async () => {
    const charge = await stripe.charges.create({
      amount: newOrder.body.price,
      currency: "gbp",
      description: "Example charge",
      source: token
    });
  })();

  // customer's order (to be passed to Message email object below)
  var content = "";
  for (var i = 0, l = baskets.length; i < l; i++) {
    content +=
      "<tr><td>" +
      baskets[i].name +
      "</td><td>" +
      baskets[i].cart +
      "</td><td>" +
      baskets[i].price +
      "</td></tr>";
  }
  console.log(content);

  // nodemailer for development using ethereal email
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("Failed to create a testing account. " + err.message);
      return process.exit(1);
    }

    console.log("Credentials obtained, sending message...");

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });

    // Message object
    let message = {
      from: "Sender Name <sender@example.com>",
      to: "Recipient <recipient@example.com>",
      subject: "Nodemailer is unicode friendly ✔",
      text: "Hello to myself!",
      html:
        "<body style='text-align:center'>" +
        "<p>Thank you " +
        cumstomerName +
        " for your order!</p>" +
        "<b>your order:</b>" +
        "<table style='text-align:center; margin-left:auto;margin-right:auto;margin-top:10px'>" +
        "<th>type</th><th>boxes</th><th>price</th>" +
        content +
        "</table>" +
        "<p>We'll be baking and posting your goodies tomorrow!</p></body>"
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log("Error occurred. " + err.message);
        return process.exit(1);
      }

      console.log("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    });
  });
  /*
  // nodemailer for production
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: emailPassword
    }
  });

  var mailOptions = {
    from: email,
    to: customerEmail,
    subject: "Thank you for your order",
    html:
      "<body style='text-align:center'>" +
        "<p>Thank you " +
        cumstomerName +
        " for your order!</p>" +
        "<b>your order:</b>" +
        "<table style='text-align:center; margin-left:auto;margin-right:auto;margin-top:10px'>" +
        "<th>type</th><th>boxes</th><th>price</th>" +
        content +
        "</table>" +
        "<p>We'll be baking and posting your goodies tomorrow!</p></body>"
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  */
});
/*
const HTTP_PORT = 5400;

app.listen(HTTP_PORT);
console.log(`Server running on port ${HTTP_PORT}`);
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});

module.exports = app;
