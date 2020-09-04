//-------------------modules & constants-------------------------------------------
const express = require("express");
const app = express();
const PORT = 8080; //default port 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

//-------------------Database and helper functions ---------------------------------
const {getUserByEmail, urlsForUser} = require("./helpers");
const generateRandomString = () => Math.random().toString(36).substring(2,8);
const hashedPassword = (userPassword) => bcrypt.hashSync(userPassword, 10); 

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"}
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

//compare if the currently logged-in user is the owner of the short url id requested.
const isOwner = (req) => req.session.user_id === urlDatabase[req.params.id].userID;


//-------------------implement MIDDLEWARES----------------------------------------
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended:true}));  
app.use(cookieSession( {
  name: "session",
  keys: ['key1', 'key2'],
}));

// -------------------ROUTEs handlers; sorted by routes(roughly)-----------------

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); 
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b><body></html>\n");
});


//-------------------GET & POST to /urls; verify user credentials

app.get("/urls", (req, res) => {

  const currentUserID = req.session.user_id;

  let templateVars = {
    urls: urlDatabase,
    user: users[currentUserID],
  }; 
  
  if (currentUserID === undefined) {
    //if user not logged-in, tell them to log-in first
    res.render("prompt_login", templateVars );
    return;

  } else if (urlsForUser(currentUserID, urlDatabase) === {}) {
    //if user logged-in but doesn't have any url items yet, display empty list
    templateVars.urls = null;

  } else {
    //if logged-in user has made some url items, display them.
    templateVars.urls = urlsForUser(currentUserID, urlDatabase);

  }

  res.render("urls_index.ejs", templateVars);

});

app.post("/urls", (req, res) => {
  //add to collection of /urls by POSTing to /urls
  const newURL = generateRandomString();

  urlDatabase[newURL] = {longURL: req.body.longURL, userID: req.session.user_id};

  res.redirect(`/urls/${newURL}`);

});

//-------------------Go to add a new url; verify user credentials

app.get("/urls/new", (req, res) => {

  const currentUserID = req.session.user_id;
  
  if (currentUserID === undefined) {
    //if user not logged-in, direct to log-in page
    res.redirect("/login");

  } else {
    //if user is logged in, go to add new url
    let templateVars = {
      user: users[currentUserID],
    };

    res.render("urls_new", templateVars);

  }  
});

//-------------------GET & POST for /urls/:id ; validate owner

app.get("/urls/:id", (req, res) => {
  //Visit a specific url item; verify user credentials
  const currentUserID = req.session.user_id;
  const urlItem = urlDatabase[req.params.id];

  let templateVars = { 
    user: users[currentUserID],
  };

  if (currentUserID === undefined) {
    //user not logged-in, tell them to log-in first
    res.render("prompt_login", templateVars );
    return;

  } else if (urlItem && isOwner(req)) {
    // logged-in user is the owner of the requested url item, show them
    templateVars.shortURL = req.params.id;
    templateVars.longURL = urlItem.longURL;
    res.render("urls_show", templateVars);

  } else if (urlItem){
    //logged-in user is NOT the owner of the requested url item, tell them they don't have permission to see
    res.render("prompt_notOwner", templateVars);

  } else {
    // if the url item requested does not exist at all
    res.send("Sorry, the page you are looking for does not exist :(");

  }
});

app.post("/urls/:id", (req, res) => {
  // update the longURL of a pre-existing url item
  const urlItem = urlDatabase[req.params.id];

  if (isOwner(req)) {
    //current-user is owner of the url item ; allow them to edit long url;
    urlItem.longURL = req.body.longURL;
  
  } 

  res.redirect("/urls");
});

//-------------------visit the actual long url website from a given short url

app.get("/u/:id", (req, res) => {

  const urlItem = urlDatabase[req.params.id];
  const actualWebsite = urlItem.longURL;

  if (!actualWebsite) {
    //if the long URL is empty, send error message
    res.send("The long URL is empty, please make sure your enter a long URL.")

  } else {
    //if the long URL exists, go to the actual site.
    res.redirect(actualWebsite);
  }
});

//-------------------GET & POST to /register; validate account info

app.get("/register", (req, res) => {
  
  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  //register with email & password
  if (!req.body.email || !req.body.password) {
    //user left one or more fields empty 
    res.status(400).send("Status code 400: Please don't leave any empty fields.");
    
  } else if (getUserByEmail(req.body.email, users)) {
    //no fields left empty, but an account related to the email entered already exists in database
    res.status(400).send("Status code 400: Email already exists.");

  } else {
    //successful registration, add user to database & redirect to main /urls page
    const user = generateRandomString();   
    users[user] = {
      id: user,
      email: req.body.email,
      password: hashedPassword(req.body.password),
    };

    req.session.user_id = user;
    res.redirect("/urls");
  }
  
});

//-------------------GET & POST to /login; validate account info

app.get("/login", (req, res) => {

  let templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login_form", templateVars);
});

app.post("/login", (req, res) => {
  
  const loginUser = getUserByEmail(req.body.email, users);

  if (loginUser === undefined) {
    //when user account that matches the email entered doesn't exist
    res.status(403).send("StatusCode 403: User doesn't exist");

  } else if (loginUser) {
    //user account exists, now validate password
    const samePassword = bcrypt.compareSync(req.body.password, users[loginUser].password);

    if (!samePassword) {
      //password failed
      res.status(403).send("StatusCode 403: Your password didn't match! Try Again.");

    } else {
      //correct password, login successful
      req.session.user_id = loginUser;
      res.redirect("/urls");
      
    }
  }
});

//-------------------GET & POST to /urls/:id/delete; validate owner

app.get("/urls/:id/delete", (req, res) => {
  //if user try to access the delete page directly
  const currentUserID = req.session.user_id;
  
  if (isOwner(req)) {
    //when current user is the owner of the given url item, allow them to delete
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");

  } else if (currentUserID) {
    //if current user is not the owner
    res.send("Sorry, you cannot delete urls that are not yours :( ");

  } else {
    //user not logged in
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => { 
  //when user delete an url item through the "delete" button
  if (isOwner(req)) {
  
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");

  } 
});

//-------------------Clear session when user logs out!

app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");

});


//-------------------server listening-------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

