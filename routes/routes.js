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

    res.render("urls_new", templateVars);
  });

  app.get("/user/urls", (req, res) => {

    const userId = req.session.userId || undefined;
    const usersURLs = database.users[userId];

    if (userId !== undefined) {
      res.render("urls_index", {usersURLs});
    } else {
      res.redirect(301, '/');
    }
  });

  app.get("/urls/:shortURL", middleware.getUserByCookie, (req, res) => {
    const userObj = req.body.userObj;
    const userUndefined = userObj == undefined;
    const shortURL = req.params.shortURL;

    console.log(userObj);
    console.log(shortURL);
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
  app.delete("/urls/:shortURL", (req, res) => {
    if (database.urlDatabase.hasOwnProperty(req.params.shortURL)) {
      delete database.urlDatabase[req.params.shortURL];
      console.log(`URL: ${req.params.shortURL} has been deleted from our database!`);
    } else {
      console.log(`URL: ${req.params.shortURL} does not exist in our database.`);
    }
    res.redirect(302, "/urls");
  });

  app.get("/app/error", (req, res) => {
    res.render("error");
  });
};