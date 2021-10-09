const bcrypt = require("bcrypt");

 async function hashPassword(password){
  const salt = await bcrypt.genSalt(10);
  let res = await bcrypt.hash(password, salt);
  return res;
};

module.exports = hashPassword;
