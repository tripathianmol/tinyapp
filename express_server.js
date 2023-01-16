const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8085; // default port 8080

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

};

// Helper functions

const generateRandomString = function(length) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';

  for (let count = 0; count < length; count++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

const userLookupFromEmail = function(email) {
  for (let user in users) {
    if (user["email"] === email) {
      return user;
    }
  }

  return null;
};

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

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// GET

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: undefined, user: users[req.cookies["user_id"]] };

  if (req.cookies["user_id"]) {
    templateVars["urls"] = urlsForUser(req.cookies["user_id"]);
    res.render("urls_index", templateVars);
  } else {
    req.status(401).send("Not logged in.");
  }
  
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]["longURL"], user: users[req.cookies["user_id"]] };
  
  if (req.cookies["user_id"] && urlDatabase[req.params.id]["userID"] === req.cookies["user_id"]) {
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
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

// POST

app.post("/urls", (req, res) => {
  let id = generateRandomString(6);
  if (req.cookies["user_id"]) {
    urlDatabase[id] = { "longURL": req.body.longURL, "userID": req.cookies["user_id"] };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Not logged in.");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies["user_id"] && urlDatabase[req.params.id]["userID"] === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else {
    res.status(401).send("Not logged in.");
  }
  
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies["user_id"] && urlDatabase[req.params.id]["userID"] === req.cookies["user_id"]) {
    urlDatabase[req.params.id]["longURL"] = req.body.updatedURL;
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(401).send("Not logged in.");
  }
  
});

app.post("/login", (req, res) => {
  if (req.cookies("user_id")) {
    res.redirect("/urls");
  } else if (userLookupFromEmail(req.body.email)) {
    const user = userLookupFromEmail(req.body.email);
    if (user["password"] === req.body.password) {
      res.cookie("user_id", user["id"]);
      res.redirect(`/ urls`);
    } else {
      res.status(403).send("Password doesn't match existing record.");
    }
  } else {
    res.status(403).send("Email doesn't match existing record.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  let randomId = generateRandomString(6);
  
  if (req.cookies["user_id"]) {
    res.redirect("urls");
  } else if (userLookupFromEmail(req.body.email)) {
    res.status(400).send("Error: email exists.");
  } else if (req.body.email === "" && req.body.password === "") {
    res.status(400).send("Error: empty fields");
  } else {
    users[randomId] = { "id": randomId, "email": req.body.email, "password": req.body. password };

    res.cookie("user_id", randomId);
    res.redirect("/urls");
  }

    
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

