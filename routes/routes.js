//const express = require('express');
const methodOverride = require('method-override');
const database = require('../database.js').database;
const middleware = require('../middleware.js');
const utilities = require('../utilities.js');
const cookieSession = require('cookie-session');

module.exports = function(app) {
  
  // Create:
  app.post("/new", 
    middleware.getUserByCookie, 
    middleware.checkInputForProtocol, 
    middleware.generateRandomString, 
    middleware.addShortURLToDatabase, 
  (req, res) => { // Create shortURL and redirect to URL info page:
    res.redirect(302, `/urls/${req.body.randomStr}`);         
  });

  app.post("/login", middleware.verifyUser, (req, res) => {
    const verifiedUser = req.body.verifiedUser;

    if ((verifiedUser != null) && (typeof verifiedUser != 'undefined')) {
      req.session.userId = verifiedUser.id;
      res.redirect(301, "/");
    } else {
      res.status(404).send('Invalid login info');
    }
    
  });

  app.post("/logout", (req, res) => {

    req.session = null;
    res.redirect('/');
  });

  app.post("/signup", 
    middleware.generateRandomString, 
    middleware.createUser, 
  (req, res) => {
    req.body.userCreated ? res.redirect("/") : res.status(404).send('User already exists!');
  });

  app.get("/", middleware.getUserByCookie, (req, res) => {
    const userObj = req.body.userObj;
    const userUndefined = typeof userObj == 'undefined';

    let templateVars = {
      username: (userUndefined ? "" : userObj.username),
      logged_in: (!userUndefined)
    };

    res.render("index", templateVars);
  });

  app.get("/user/urls", middleware.getUserByCookie, (req, res) => {
    const userObj = req.body.userObj;
    const userId = req.body.userObj && req.body.userObj.id;
    const userUndefined = (typeof userObj == 'undefined');
    const usersURLs = userUndefined ? 'undefined' : utilities.getUsersUrlsById(userId);
    const templateVars = {
      usersURLs, 
      logged_in: !userUndefined,
      username: (userUndefined ? "" : req.body.userObj.username)
    };
    
    if (!userUndefined) {
      res.render("user_urls", templateVars);
    } else {
      res.redirect(302, '/');
    }
  });

  app.get("/urls/:shortURL", middleware.getUserByCookie, (req, res) => {
    const userObj = req.body.userObj;
    const userUndefined = (typeof userObj == 'undefined');
    const shortURL = req.params.shortURL;
    const usersURLs = userUndefined ? 'undefined' : utilities.getUsersUrlsById(userObj.userId);

    let templateVars = {
      username: (userUndefined ? "" : userObj.username),
      logged_in: (!userUndefined),
      shortURL: req.params.shortURL,
      longURL: database.urls[shortURL].longURL,
      usersURLs: usersURLs
    };

    res.render("url_info", templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
    // Redirect to longURL
    const shortURL = req.params.shortURL;

    const longURL = database.urls[shortURL].longURL || "/app/error/";
    res.redirect(301, longURL);
  });

  // Update:
  
  app.put("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;

    database.urls[shortURL].longURL = req.body.newURL;
    console.log(`Updated URL to: ${req.body.newURL}`);
    res.redirect(302, `/urls/${shortURL}`);
  });

  // Delete:
  app.delete("/urls/:shortURL", middleware.getUserByCookie, (req, res) => {
    const urls = database.urls;
    const userObj = req.body.userObj;
    const shortURL = req.params.shortURL;

    if (urls[shortURL].userId === userObj.id) {
      delete urls[shortURL];
      console.log(`URL: ${shortURL} has been deleted from our database!`);
    } else {
      console.log(`URL: ${shortURL} does not exist in our database.`);
    }

    res.redirect(302, "/user/urls");
  });

  app.get("/app/error", (req, res) => {
    res.render("error");
  });
};
