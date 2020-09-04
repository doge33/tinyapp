//look up user by email entered
const getUserByEmail = (email, database) => {

  for (let user in database) {

    if (database[user].email === email) {
      return user;
    }
  }
};

//Get the curent logged-in user's shortURLs in the urlDatabase
const urlsForUser = (id, urlDatabase) => {

  let userURLs ={};

  for (let shortURL in urlDatabase) {
    
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = {longURL: urlDatabase[shortURL].longURL, userID: id};
    }
  }
  return userURLs;
};




module.exports = {getUserByEmail, urlsForUser};