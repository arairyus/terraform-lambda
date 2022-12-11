const fetch = require("node-fetch");

exports.handler = async (event) => {
  fetch("https://api.github.com/users/github")
    .then((res) => res.json())
    .then((json) => console.log(json));
};
