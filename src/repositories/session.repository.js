const { GameSession } = require('../models');

// A row, or null. Module 2 will add create() and update() to this file.
function findByCode(code) {
  return GameSession.findOne({ where: { join_code: code } });
}

module.exports = { findByCode };