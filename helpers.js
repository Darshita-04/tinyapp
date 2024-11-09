// check if an email already exists in the users object

const getUserByEmail = (email,database) => {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return user;
    }
  }
  return null;
};


// filter URL for loggen in users

const urlsForUser = (id,databse) => {
  const userUrls = {};
  for (let url in databse) {
    if (databse[url].userID === id) {
      userUrls[url] = databse[url];
    }
  }
  return userUrls;
}

module.exports = { getUserByEmail, urlsForUser};