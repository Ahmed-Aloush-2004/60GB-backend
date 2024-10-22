const jwt = require("jsonwebtoken");

module.exports.createToken = async (data) => {
  const token = jwt.sign(data, process.env.SECERT, {
    expiresIn: "7d",
  });
  return token;
};
