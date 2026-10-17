'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(10),
        allowNull: false
      }
    });

    await queryInterface.addConstraint('users', {
      fields: ['role'],
      type: 'check',
      name: 'ck_users_role',
      where: Sequelize.literal("role IN ('HOST', 'PLAYER')")
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
