const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (user["email"] === email) {
      return user;
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

module.exports = { getUserByEmail, generateRandomString };