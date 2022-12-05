import { config } from "dotenv";
import express, { json, urlencoded } from "express";
import cors from "cors";
import routes from "./routes/index.js";
config();
const app = express();
var allowlist = [
  "http://127.0.0.1:5500",
  "https://teal-smiling-tick.cyclic.app",
  "https://formula-fig-staging.myshopify.com",
];
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
var corsOptionsDelegate = function (req, callback) {
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions.origin = true; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions.origin = false; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

process.env.debug = true;
app.use(cors(corsOptionsDelegate)); // Use this after the variable declaration
// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
// app.all("*", (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", [
//     "http://127.0.0.1:5500",
//     "https://teal-smiling-tick.cyclic.app",
//   ]);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
// const db = require("cyclic-dynamodb");

app.use(json());
app.use(urlencoded({ extended: true }));

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

app.use("/", routes);

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "no route handler found" }).end();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});
