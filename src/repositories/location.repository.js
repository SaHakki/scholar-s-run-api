const { Location } = require('../models');

function findById(id) {
  return Location.findByPk(id); // a row, or null
}

module.exports = { findById };