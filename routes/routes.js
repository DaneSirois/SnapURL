//const express = require('express');
const methodOverride = require('method-override');
const database = require('../database.js').database;
const middleware = require('../middleware.js');
const cookieSession = require('cookie-session');

module.exports = function(app) {
  // Create:
  
  app.post("/new", middleware.checkInputForProtocol, middleware.generateRandomString, middleware.addShortURLToDatabase, (req, res) => {
    // Create shortURL and redirect to URL info page:

    res.redirect(302, `/urls/${req.body.randomStr}`);         
  });

  app.post("/login", middleware.verifyUser, (req, res) => {
    const verifiedUser = req.body.verifiedUser;

    if ((verifiedUser != null) && (verifiedUser != undefined)) {
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

  app.post("/signup", middleware.generateRandomString, middleware.createUser, (req, res) => {
    req.body.userCreated ? res.redirect("/") : res.status(404).send('User already exists!');
  });

  app.get("/", middleware.getUserByCookie, (req, res) => {
    const userObj = req.body.userObj;

    let templateVars = {
      username: (userObj == undefined ? "" : userObj.username),
      logged_in: (userObj !== undefined)
    };

    res.render("index", templateVars);
  });

  app.get("/user/urls", middleware.getUserByCookie, (req, res) => {

    const userId = req.session.userId || undefined;
    const usersURLs = database.users[userId];
    const templateVars = {
      usersURLs, 
      logged_in: typeof userId !== 'undefined',
      username: (userObj == undefined ? "" : req.body.userObj.username)
    };
    if (userId !== undefined) {
      res.render("user_urls", templateVars);
    } else {
      res.redirect(301, '/');
    }
  });

  app.get("/urls/:shortURL", middleware.getUserByCookie, (req, res) => {
    const userObj = req.body.userObj;
    const userUndefined = userObj == undefined;
    const shortURL = req.params.shortURL;

    let templateVars = {
      userURLs: (userUndefined ? "" : userObj.urls),
      username: (userUndefined ? "" : userObj.username),
      logged_in: (userObj !== undefined),
      shortURL: req.params.shortURL,
      longURL: userUndefined ? database.urlDatabase[shortURL] : userObj.urls[shortURL]
    };

    res.render("url_info", templateVars);
  });

  app.get("/:shortURL", (req, res) => {
    // Redirect to longURL
    const shortURL = req.params.shortURL;
    const longURL = database.urlDatabase[shortURL] || "/app/error/";
    res.redirect(301, longURL);
  });

  app.get("/urls.json", (req, res) => {
    res.json(database.urlDatabase);
  });

  // Update:
  
  app.put("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;

    database.urlDatabase[shortURL] = req.body.newURL;
    console.log(`Updated URL to: ${req.body.newURL}`);
    res.redirect(302, `/urls/${shortURL}`);
  });

  // Delete:
  app.delete("/urls/:shortURL", middleware.getUserByCookie, (req, res) => {
    const sharedURLs = database.urlDatabase;
    const user = database.users[req.body.userId];

    if (typeof user.urls.hasOwnProperty(req.params.shortURL) !== 'undefined') {
      
      delete user.urls[req.params.shortURL];
      console.log("USER URLS");
      console.log(`URL: ${req.params.shortURL} has been deleted from our database!`);
    } else if (typeof sharedURLs.hasOwnProperty(req.params.shortURL) !== 'undefined') {
      
      delete sharedURLs[req.params.shortURL]
      console.log("SHARED URLS");
      console.log(`URL: ${req.params.shortURL} has been deleted from our database!`);
    } else {
      console.log(`URL: ${req.params.shortURL} does not exist in our database.`);
    }
    
    res.redirect(302, "/user/urls");
  });

  app.get("/app/error", (req, res) => {
    res.render("error");
  });
};