'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location_visits', {
      location_visit_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      run_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'runs',
          key: 'run_id'
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
      visit_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_perfect: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      entered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addConstraint('location_visits', {
      fields: ['run_id', 'visit_number'],
      type: 'unique',
      name: 'uq_location_visits_run_visit_number'
    });

    await queryInterface.addConstraint('location_visits', {
      fields: ['visit_number'],
      type: 'check',
      name: 'ck_location_visits_visit_number_positive',
      where: Sequelize.literal('visit_number > 0')
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('location_visits');
  }
};

