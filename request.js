const axios = require('axios')

const instance = axios.create();
  // console.log(instance);


// module.exports.request = request;
module.exports = {
  request: instance,
}