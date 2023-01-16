const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8085; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

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

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/login", (req, res) => {
  if (userLookupFromEmail(req.body.email)) {
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
  
  if (userLookupFromEmail(req.body.email)) {
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

