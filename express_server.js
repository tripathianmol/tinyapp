const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString } = require('./helpers');

const app = express();
const PORT = 8085;

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['random', 'word']}));

app.set("view engine", "ejs");

// Helpers

const urlsForUser = function(id) {
  let matchedKeys = [];

  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key]["userID"] === id) {
      matchedKeys.push(key);
    }
  }

  let urls = {};

  for (let key of matchedKeys) {
    urls[key] = urlDatabase[key];
  }

  return urls;
};

// Data

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

const users = {
  's3Kc5k': {
    'id': 's3Kc5k',
    'email': 'test@test.com',
    'password': 'test'
  }
};

// GET

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: undefined, user: undefined };
  
  if (req.session["user_id"]) {
    templateVars["urls"] = urlsForUser(req.session["user_id"]);
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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]["longURL"];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(400).send("Bad short url: does not exist");
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: undefined };
  
  if (req.session["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render("registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: undefined };

  if (req.session["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render("login", templateVars);
  }
});

// POST

app.post("/urls", (req, res) => {
  let id = generateRandomString(6);

  if (req.session["user_id"]) {
    urlDatabase[id] = { "longURL": req.body.longURL, "userID": req.session["user_id"] };
    console.log(urlDatabase);
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Not logged in.");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session["user_id"] && urlDatabase[req.params.id]["userID"] === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    console.log(urlDatabase);
    res.redirect(`/urls`);
  } else {
    res.status(401).send("Not logged in.");
  }
  
});

app.post("/urls/:id", (req, res) => {
  if (req.session["user_id"] && urlDatabase[req.params.id]["userID"] === req.session["user_id"]) {
    urlDatabase[req.params.id]["longURL"] = req.body.updatedURL;
    console.log(urlDatabase);
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(401).send("Not logged in.");
  }
});

app.post("/login", (req, res) => {
  console.log(users);
  console.log(getUserByEmail(req.body.email, users));
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else if (getUserByEmail(req.body.email, users)) {
    const user = getUserByEmail(req.body.email, users);

    if (bcrypt.compareSync(req.body.password, user["password"])) {
      req.session["user_id"] = user["id"];
      res.redirect(`/urls`);
    } else {
      res.status(403).send("Password doesn't match existing record.");
    }
  } else {
    res.status(403).send("Email doesn't match existing record.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

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
    console.log("user added\n");
    console.log(users);
    req.session["user_id"] = randomId;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  console.log(users);
  console.log(urlDatabase);
});

