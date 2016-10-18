const database = require('./database.js').database;
const utilities = require('./utilities');
const bcrypt = require('bcrypt');

const generateRandomString = function (req, res, next) {
  let randomStr = "";
  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";

  for (let i = 0; i <= 6; i++) {
    randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  req.body['randomStr'] = randomStr;

  next();
};

const checkInputForProtocol = function (req, res, next) {
  const url = req.body.longURL;

  if (!/^(f|ht)tps?:\/\//i.test(url)) {
    let newURL = "http://" + url;
    req.body.longURL = newURL;
  } 

  next();
};

const addShortURLToDatabase = function (req, res, next) {
  const userId = req.session['userId'];
  const shortURL = req.body['randomStr'];
  const longURL = req.body['longURL'];
  console.log("USER ID:");
  console.log(userId);
  console.log("USERS DATABASE:")
  console.log(database.users[userId]);
  if (userId !== undefined) {
    database.users[userId].urls[shortURL] = longURL;
  } else {
    database.urlDatabase[shortURL] = longURL;
  }
  
  next();
};

const createUser = function (req, res, next) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  const userObj = {id: req.body.randomStr, username, email, hashed_password, urls: {}};
  let userExists;

  for (userId in database.users) {
    if (database.users[userId].email === userObj.email) {
      userExists = true;
    }
  }
  
  if (email == undefined || password == undefined || username == undefined || userExists) {
    req.body['userCreated'] = false;
  } else {
    database.users[userObj.id] = userObj;
    req.body['userCreated'] = true;
  }
  
  next();
}

const getUserByCookie = function (req, res, next) {
  const userId = req.session.userId || undefined;

  userId == undefined ? req.body.userObj = undefined : req.body.userObj = database.users[userId];
  
  next();
};

const verifyUser = function (req, res, next) {
  const email = req.body.email || undefined;
  const passwordInput = req.body.password;

  const userObj = utilities.getUserByEmail(email);

  if ((userObj != null) && (userObj != undefined)) {
    let hashed_password = userObj.hashed_password;
    console.log(userObj);
    bcrypt.compareSync(passwordInput, hashed_password) ? req.body['verifiedUser'] = userObj : req.body['verifiedUser'] = null;
  }
  next();
};


module.exports = {
  checkInputForProtocol,
  generateRandomString,
  addShortURLToDatabase,
  createUser,
  verifyUser,
  getUserByCookie
}