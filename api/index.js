const express = require("express");
const app = express();

// Your Express setup here
app.get("/", (req, res) => {
    res.send("Hello from Vercel!");
});

module.exports = app;
module.exports.handler = require("@vercel/node").createServer(app);
