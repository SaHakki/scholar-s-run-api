'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // One nickname per game. Two players cannot both be "Pao" in the same session.
    await queryInterface.addConstraint('seats', {
      type: 'unique',
      name: 'uq_seats_session_nickname',
      fields: ['session_id', 'nickname'],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('seats', 'uq_seats_session_nickname');
  },
};