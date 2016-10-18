const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

// Middleware:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }))
app.use(methodOverride('_method'));
app.use(express.static('public'));
  
// View Engine:
app.set("view engine", "ejs");

// Require routes: 
require('./routes/routes.js')(app);

// Fire:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});