// check if an email already exists in the users object

const getUserByEmail = (email,database) => {
  for (let user in database) {
    if (database[user]['email'] === email) {
      return user;
    }
  }
  return null;
};


module.exports = getUserByEmail;