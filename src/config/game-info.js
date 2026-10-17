// What the Library Game Hub shows about YOUR game (Hub Contract, rule 1).
// Lab Step 6: replace every CHANGE_ME value with your own.
const pkg = require('../../package.json');

module.exports = {
  slug: 'scholar-s-run-api',            // your group's game, lower case with hyphens, for example shelf-climb
  name: "Scholar's Run",            // the name players will see
  team: '3c (3-1)',            // your group's name and section, for example Bookworms (3-1)
  developer: 'SaHakki',       // YOUR GitHub username: this build is yours
  description: "Scholar's Run is a timed, campus-based quiz survival and strategy game where players navigate university locations, answer questions, manage their Energy, and compete for the highest final score.",     // one sentence about how the game is played
  min_players: 2,               // change to the limits your game is designed for
  max_players: 12,
  version: pkg.version,         // read from package.json, do not edit here
};
