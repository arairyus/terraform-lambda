const fetch = require("node-fetch");

exports.handler = async (event) => {
  const response = await fetch("https://api.github.com/users/github");
  const data = await response.json();

  console.log(data);
};
