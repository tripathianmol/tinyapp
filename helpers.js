const getUserByEmail = function(email, database) {
  for (let userID of Object.keys(database)) {
    if (database[userID]["email"] === email) {
      return database[userID];
    }
  }

  return null;
};

const generateRandomString = function(length) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';

  for (let count = 0; count < length; count++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

const urlsForUser = function(id, database) {
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };