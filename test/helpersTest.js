const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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