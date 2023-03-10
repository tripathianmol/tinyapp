const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8085;

/********************
// MIDDLEWARE
********************/

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['random', 'word']}));

app.set("view engine", "ejs");

/********************
// DATA
********************/

// Contains URL data
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "s3Kc5k"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "s3Kc5k"
  }
};

// Contains user data
const users = {
  's3Kc5k': {
    'id': 's3Kc5k',
    'email': 'test@test.com',
    'password': 'test'
  }
};

/********************
// GET
********************/

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Logs user out
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Main page where URLs displayed for logged in user
app.get("/urls", (req, res) => {
  const templateVars = { urls: undefined, user: undefined };
  
  if (req.session["user_id"]) {
    templateVars["urls"] = urlsForUser(req.session["user_id"], urlDatabase);
    templateVars['user'] = users[req.session["user_id"]];
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send("Not logged in.");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: undefined };

  if (req.session["user_id"]) {
    templateVars['user'] = users[req.session["user_id"]];
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]["longURL"], user: undefined };
  
  if (req.session["user_id"] && urlDatabase[req.params.id]["userID"] === req.session["user_id"]) {
    templateVars['user'] = users[req.session["user_id"]];
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("Not logged in.");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Short URL link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]["longURL"];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(400).send("Bad short url: does not exist");
  }
});

// Registration page
app.get("/register", (req, res) => {
  const templateVars = { user: undefined };
  
  if (req.session["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render("registration", templateVars);
  }
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = { user: undefined };

  if (req.session["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render("login", templateVars);
  }
});

/********************
// POST
********************/

// Add URL for user
app.post("/urls", (req, res) => {
  let id = generateRandomString(6);

  if (req.session["user_id"]) {
    urlDatabase[id] = { "longURL": req.body.longURL, "userID": req.session["user_id"] };
    
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Not logged in.");
  }
});

// Delete URL for logged in user
app.post("/urls/:id/delete", (req, res) => {
  if (req.session["user_id"] && urlDatabase[req.params.id]["userID"] === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.status(401).send("Not logged in.");
  }
  
});

// Update URL for logged in user
app.post("/urls/:id", (req, res) => {
  if (req.session["user_id"] && urlDatabase[req.params.id]["userID"] === req.session["user_id"]) {
    urlDatabase[req.params.id]["longURL"] = req.body.updatedURL;
    
    res.redirect(`/urls`);
  } else {
    res.status(401).send("Not logged in.");
  }
});

// User login
app.post("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else if (getUserByEmail(req.body.email, users)) {
    const user = getUserByEmail(req.body.email, users);

    if (bcrypt.compareSync(req.body.password, user["password"])) {
      //Successful login
      req.session["user_id"] = user["id"];
      res.redirect(`/urls`);
    } else {
      res.status(403).send("Password doesn't match existing record.");
    }
  } else {
    res.status(403).send("Email doesn't match existing record.");
  }
});

// User logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// User registered and login info added to database
app.post("/register", (req, res) => {
  let randomId = generateRandomString(6);
  
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("Error: email exists.");
  } else if (req.body.email === "" && req.body.password === "") {
    res.status(400).send("Error: empty fields");
  } else {
    users[randomId] = { "id": randomId, "email": req.body.email, "password": bcrypt.hashSync(req.body.password) };
    
    req.session["user_id"] = randomId;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

