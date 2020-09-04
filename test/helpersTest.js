const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
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
};

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"},
  s9djw4: { longURL: "https://www.canada.ca", userID: "hwebd9"}
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined if email entered does not exist in user database', function() {
    const user = getUserByEmail("yayaya@haha.com", testUsers);
    const expectedOutput = undefined;

    assert.strictEqual(user, expectedOutput);
  })
});

describe('urlsForUser', function() {

  it ('should return the urls belonged to a given user', function() {

    const userURLs = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"}
    }

    assert.deepEqual(userURLs, expectedOutput);
  });

  it ('should return an empty object if given user has no shortened urls', function() {

    const userURLs = urlsForUser("user2RandomID", testUrlDatabase); 
    const expectedOutput = {};

    assert.deepEqual(userURLs, expectedOutput);
  })

})