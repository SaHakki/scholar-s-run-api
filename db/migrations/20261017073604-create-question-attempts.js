'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question_attempts', {
      question_attempt_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      location_visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'location_visits',
          key: 'location_visit_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'question_id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      selected_choice: {
        type: Sequelize.CHAR(1),
        allowNull: false
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      points_awarded: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      energy_delta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addConstraint('question_attempts', {
      fields: ['selected_choice'],
      type: 'check',
      name: 'ck_question_attempts_selected_choice',
      where: Sequelize.literal(
        "selected_choice IN ('A', 'B', 'C', 'D')"
      )
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('question_attempts');
  }
};

