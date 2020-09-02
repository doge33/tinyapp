const express = require("express");
const app = express();
const PORT = 8080; //default port 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-Parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//generate 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);

}

//middlewares(process in btween req & resp)
app.set("view engine", "ejs");  //for GET (so far)l
app.use(bodyParser.urlencoded({extended:true}));  //for POST (to make data human-readable)
app.use(cookieParser());

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
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
  }; //need to send variable INSIDE AN OBJECT to an EJS template!
  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => { //when user try to go here, show them the form(urls_new)l
  let templateVars = {
    user_id: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);  //you need http:// or https://
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
  };
  res.render("register", templateVars)
})


//POST req starts HERE
app.post("/urls", (req, res) => {

  const newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL; // => this, req.body is where you utilize bodyParser!
   
  //console.log(urlDatabase); //log the POST req body to the console (for reference here)
  res.redirect(`/urls/${newURL}`);     

});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; //shortURL exists in req.params; undefined by itself
  res.redirect("/urls/");

});

app.post("/urls/:id", (req, res) => {
  //console.log("req.params: " + req.params);
  //console.log("req.body.longURL: " + req.body.longURL);
  //console.log("urlDatabase[req.params.id]: "+ urlDatabase[req.params.id]);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //console.log(`(value of)the user_id in req.body: ${req.body.user_id}`);
  res.cookie("user_id", req.body.user_id); // the user_id and its value is in the body of the POST req sent by client. Set it in server's response
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");

});

app.post("/register", (req, res) => {

  const newUserId = generateRandomString();

  users[newUserId] = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password,  
  }
  res.cookie("user_id", newUserId);
  //console.log(users[newUserId]);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

