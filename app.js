const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

// Stripe test & live secret keys
const testKey = process.env.testkey;
const liveKey = process.env.livekey;

var stripe = require("stripe")(testKey);

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
  const newOrder = req.body;
  // console.log(newOrder.body.token.id);
  // console.log(newOrder.body.args.billing_name);
  // console.log(newOrder);

  // email can be added for stripe auto receipts:
  // receipt_email: "ckp83@hotmail.com"

  // Token is created using Checkout or Elements!
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
