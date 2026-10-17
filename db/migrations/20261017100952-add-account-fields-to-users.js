'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('users', 'name', 'full_name');

    await queryInterface.addColumn('users', 'school_id', {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true
    });

    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'email');
    await queryInterface.removeColumn('users', 'school_id');
    await queryInterface.renameColumn('users', 'full_name', 'name');
  }
};
