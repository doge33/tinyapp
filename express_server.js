const express = require("express");
const app = express();
const PORT = 8080; //default port 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-Parser");
const bcrypt = require("bcrypt");

/* previous urlDatabse object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
*/

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//helper for generating hashedPassword
const hashedPassword = (userPassword) => {
  return bcrypt.hashSync(userPassword, 10); 
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword("dishwasher-funk")
  }
};

//generate 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};
//email lookup in users to make sure users don't register with a pre-existing email
const emailExistsUser = (newEmail) => {
  for (let user in users) {
    if (users[user].email === newEmail) {
      return user;
    }
  }
};
//compare the curent logged-in user's id to userID for each shortURL in the urlDatabase
const urlsForUser = (id) => {

  let userURLs ={};

  for (let shortURL in urlDatabase) {
    
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = {longURL: urlDatabase[shortURL].longURL, userID: id};
    }
  }
  return userURLs;
};


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
    user: users[req.cookies["user_id"]],
  }; 

  if (req.cookies["user_id"] === undefined) {
    res.render("prompt_login", templateVars );
    return;

  } else if (urlsForUser(req.cookies["user_id"]) === {}) {
    //console.log("urls undefined");
    templateVars.urls = null;

  } else {
      templateVars.urls = urlsForUser(req.cookies["user_id"]);
      //console.log(urlDatabase);
  }
  res.render("urls_index.ejs", templateVars);
});



app.get("/urls/new", (req, res) => { //when user try to go here, show them the form(urls_new)l
  
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");

  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_new", templateVars);
  }
  
});

app.get("/urls/:id", (req, res) => {
  //console.log(req.params);
  let templateVars = { 
    user: users[req.cookies["user_id"]],
  };

  if (req.cookies["user_id"] === undefined) {
    res.render("prompt_login", templateVars );
    return;

  } else {
    templateVars.shortURL = req.params.id;
    templateVars.longURL = urlDatabase[req.params.id].longURL;
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);  //you need http:// or https://
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login_form", templateVars);
});

//POST req starts HERE
app.post("/urls", (req, res) => {

  const newURL = generateRandomString();
  urlDatabase[newURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]} // => this, req.body is where you utilize bodyParser!
  //console.log(urlDatabase); //log the POST req body to the console (for reference here)
  res.redirect(`/urls/${newURL}`);

});

app.post("/urls/:id/delete", (req, res) => {

  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID) {
  delete urlDatabase[req.params.id]; //shortURL exists in req.params; undefined by itself
  //console.log(urlDatabase);
  }
  res.redirect("/urls/");

});

app.post("/urls/:id", (req, res) => {
  //console.log("req.params: " + req.params);
  //console.log("req.body.longURL: " + req.body.longURL);
  //console.log("urlDatabase[req.params.id]: "+ urlDatabase[req.params.id]);
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  
  }                                 
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //console.log(`(value of)the user_id in req.body: ${req.body.user_id}`);
  //console.log(req.body); //show email and password the user logs-in with;
  const loginUser = emailExistsUser(req.body.email);

  if (loginUser === undefined) { //when user that matches the email account doesn't exist
    res.statusCode = 403; // I changed this manually, otherwise it's 200. Is this supposed to be?
    throw new Error(`Status code: ${res.statusCode} ---> Account doesn't exist.`);

  } else if (loginUser) {
    const samePassword = bcrypt.compareSync(req.body.password, users[loginUser].password);

    if (!samePassword) {
      console.log(users[loginUser]);
      res.statusCode = 403;
      throw new Error(`Status code: ${res.statusCode} ---> Your password didn't match! Try Again.`);

    } else {
      res.cookie("user_id", loginUser); // the user_id and its value is in the body of the POST req sent by client. Set it in server's response
      res.redirect("/urls");
      
    }
  }
});

app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");

});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    //console.log("users if empty field exists: " + JSON.stringify(users));
    res.statusCode = 400; // I changed this manually, otherwise it's 200. Is this supposed to be?
    throw new Error(`Status code: ${res.statusCode} ---> Please don't leave any empty fields.`);
    
  } else if (emailExistsUser(req.body.email)) { //when user matching the email account already exists
    //console.log("users if email already exists: " + JSON.stringify(users));
    res.statusCode = 400;
    throw new Error(`Status code: ${res.statusCode} ---> Email already exists.`);

  } else {
    const user = generateRandomString();
    users[user] = {
      id: user,
      email: req.body.email,
      password: hashedPassword(req.body.password),
    };
    //console.log("users when register succeed: " + JSON.stringify(users));
    res.cookie("user_id", user);
    res.redirect("/urls");
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

