const { assert } = require('chai');
const getUserByEmail = require('../helpers.js');

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
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(expectedUserID, user);
  });

  it('should return undefined if user is not there with provided email', function() {
    const user = getUserByEmail("use1r@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});