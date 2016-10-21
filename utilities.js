const database = require('./database.js').database;

const getUserByEmail = function (email) {
  let answer;
  for (userObj in database.users) {
    if (email !== undefined) {
      database.users[userObj].email === email ? answer = database.users[userObj] : answer = null;
    }
  }
  return answer;
}

const getUsersUrlsById = function (userId) {
  const usersURLs = [];

  if (userId) {
    for (let key in database.urls) {
      if (database.urls[key].userId === userId) {
        usersURLs.push(database.urls[key]);
      }
    }
  }
  
  return usersURLs;
};

module.exports = {
  getUserByEmail,
  getUsersUrlsById
};