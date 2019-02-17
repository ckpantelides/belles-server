const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

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
  console.log(newOrder.body.token.id);
  console.log(newOrder.body.args.billing_name);
});

const HTTP_PORT = 4000;

app.listen(HTTP_PORT);
console.log(`Server running on port ${HTTP_PORT}`);

module.exports = app;
