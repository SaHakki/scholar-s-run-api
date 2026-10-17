'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location_rewards_claimed', {
      reward_claim_id: {
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
      energy_awarded: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      claimed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addConstraint('location_rewards_claimed', {
      fields: ['run_id', 'location_id'],
      type: 'unique',
      name: 'uq_location_rewards_run_location'
    });

    await queryInterface.addConstraint('location_rewards_claimed', {
      fields: ['energy_awarded'],
      type: 'check',
      name: 'ck_location_rewards_energy_nonnegative',
      where: Sequelize.literal('energy_awarded >= 0')
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('location_rewards_claimed');
  }
};

