/**
 * 
 * @param {*} email is the email to lookup in the database
 * @param {*} database is the database that holds all the emails
 * @returns returns the user object for the found user, or null is user not found
 */
const getUserByEmail = function(email, database) {
  for (let userID of Object.keys(database)) {
    if (database[userID]["email"] === email) {
      return database[userID];
    }
  }

  return null;
};

/**
 * 
 * @param {*} length is the length of the random string generated
 * @returns is the random string generated of length provided
 */
const generateRandomString = function(length) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';

  for (let count = 0; count < length; count++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

/**
 * 
 * @param {*} id is the user id whose URLs we are searching for
 * @param {*} database is the database of URLs from which we are getting URLS for the id provided
 * @returns an object containing all the URLs for the given id
 */
const urlsForUser = function(id, database) {
  let matchedKeys = [];

  for (let key of Object.keys(database)) {
    if (database[key]["userID"] === id) {
      matchedKeys.push(key);
    }
  }

  let urls = {};

  for (let key of matchedKeys) {
    urls[key] = database[key];
  }

  return urls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };