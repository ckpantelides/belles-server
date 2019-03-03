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
  // const util = require("util");
  // console.log(util.inspect(baskets, false, null, true));

  // console.log(newOrder.body.token.id);
  // console.log(newOrder.body.args.billing_name);
  // console.log(newOrder);

  // email can be added for stripe auto receipts:
  // receipt_email:

  // Token is created using Checkout
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

  // nodemailer
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: emailPassword
    }
  });

  var content = [];
  for (var i = 0, l = baskets.length; i < l; i++) {
    content.push(
      "<tr><td>" +
        baskets[i].name +
        "</td><td>" +
        baskets[i].cart +
        "</td><td>" +
        baskets[i].price +
        "</td></tr>"
    );
  }

  var mailOptions = {
    from: email,
    to: customerEmail,
    subject: "Thank you for your order",
    html:
      "<b>your order</b>" +
      "<table><th>type</th><th>boxes</th><th>price</th>" +
      content +
      "</table>"
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
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
