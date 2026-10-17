'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_sessions', {
      session_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      join_code: {
        type: Sequelize.STRING(6),
        allowNull: false,
        unique: true
      },
      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      duration_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 720
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ends_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addConstraint('game_sessions', {
      fields: ['status'],
      type: 'check',
      name: 'ck_game_sessions_status',
      where: Sequelize.literal(
        "status IN ('WAITING', 'ACTIVE', 'FINISHED')"
      )
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('game_sessions');
  }
};

