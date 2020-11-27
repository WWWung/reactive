const args = require("minimist")(
  JSON.parse(process.env.npm_config_argv).original.slice(1),
  {
    string: ["f"],
  }
);

const file = args.f || ""
const matchString = `${file}.test.js`
module.exports = {
    testRegex: matchString
};
