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

module.exports = {
  getUserByEmail
};