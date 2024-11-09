const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require("../helpers.js");

// Mock data for testing

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
    const expectedUserID = "userRandomID";
    assert.equal(expectedUserID, user);
  });

  it('should return undefined if user is not there with provided email', function() {
    const user = getUserByEmail("use1r@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});


// Mock data for testing
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
  "6csWv2": { longURL: "http://www.example.com", userID: "user1" }
};

describe('urlsForUser', function() {
  it('should return URLs that belong to the specified user', function() {
    const userID = "user1";
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "6csWv2": { longURL: "http://www.example.com", userID: "user1" }
    };
    
    const result = urlsForUser(userID, urlDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return only the URLs that belong to the specified user');
  });

  it('should return an empty object if the urlDatabase does not contain any URLs that belong to the specified user', function() {
    const userID = "user3";
    const expectedOutput = {};
    
    const result = urlsForUser(userID, urlDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return an empty object if no URLs belong to the specified user');
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const userID = "user1";
    const emptyDatabase = {};
    const expectedOutput = {};
    
    const result = urlsForUser(userID, emptyDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return an empty object if the urlDatabase is empty');
  });

  it('should not return any URLs that do not belong to the specified user', function() {
    const userID = "user2";
    const result = urlsForUser(userID, urlDatabase);
    
    // Check that none of the URLs in result are owned by a different user
    const allUrlsBelongToUser = Object.values(result).every(url => url.userID === userID);
    assert.isTrue(allUrlsBelongToUser, 'The function should not return any URLs that do not belong to the specified user');
  });
});