'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location_routes', {
      location_route_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      from_location_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'locations',
          key: 'location_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      to_location_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'locations',
          key: 'location_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('location_routes', {
      fields: ['from_location_id', 'to_location_id'],
      type: 'unique',
      name: 'uq_location_routes_from_to'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('location_routes');
  }
};

