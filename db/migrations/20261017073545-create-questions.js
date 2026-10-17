'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      question_id: {
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
      location_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'locations',
          key: 'location_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      choice_a: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      choice_b: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      choice_c: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      choice_d: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      correct_choice: {
        type: Sequelize.CHAR(1),
        allowNull: false
      }
    });

    await queryInterface.addConstraint('questions', {
      fields: ['correct_choice'],
      type: 'check',
      name: 'ck_questions_correct_choice',
      where: Sequelize.literal(
        "correct_choice IN ('A', 'B', 'C', 'D')"
      )
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('questions');
  }
};

