const express = require("express");
const app = express();
const PORT = 8080; //default port 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

//app.get("/urls.json", (req, res) => {
 // res.json(urlDatabase); // means send it as json object
//});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b><body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase}; //need to send variable INSIDE AN OBJECT to an EJS template!
  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase.b2xVn2};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});