'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seats', {
      seat_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'game_sessions',
          key: 'session_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      nickname: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addConstraint('seats', {
      fields: ['session_id', 'user_id'],
      type: 'unique',
      name: 'uq_seats_session_user'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seats');
  }
};

