const express = require("express");
const app = express();
const PORT = 8080; //default port 8080;
const bodyParser = require("body-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//generate 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);

}


//middlewares(process in btween req & resp)
app.set("view engine", "ejs");  //for GET (so far)l
app.use(bodyParser.urlencoded({extended:true}));  //for POST (to make data human-readable)


// handlers
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // means send it as json object
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b><body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase}; //need to send variable INSIDE AN OBJECT to an EJS template!
  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => { //when user try to go here, show them the form(urls_new)l
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase.b2xVn2};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  const newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
   
  console.log(urlDatabase); //log the POST req body to the console (for reference here)
  res.redirect("/urls");     //after posting, it's better to redirect

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});