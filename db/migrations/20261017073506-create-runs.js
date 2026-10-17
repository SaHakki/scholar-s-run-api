'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('runs', {
      run_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      seat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'seats',
          key: 'seat_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      energy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      accumulated_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      final_score: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ended_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addConstraint('runs', {
      fields: ['status'],
      type: 'check',
      name: 'ck_runs_status',
      where: Sequelize.literal(
        "status IN ('ACTIVE', 'ELIMINATED', 'FINISHED')"
      )
    });

    await queryInterface.addConstraint('runs', {
      fields: ['energy'],
      type: 'check',
      name: 'ck_runs_energy_nonnegative',
      where: Sequelize.literal('energy >= 0')
    });

    await queryInterface.addConstraint('runs', {
      fields: ['accumulated_points'],
      type: 'check',
      name: 'ck_runs_points_nonnegative',
      where: Sequelize.literal('accumulated_points >= 0')
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('runs');
  }
};

