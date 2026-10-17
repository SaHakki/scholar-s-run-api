'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const locations = [
      {
        name: 'Admin Building',
        description: 'Campus location for university administration and governance questions.',
        energy_reward: 0
      },
      {
        name: 'Manggahan',
        description: 'Campus location featuring trivia and general knowledge questions.',
        energy_reward: 1
      },
      {
        name: 'The Clinic',
        description: 'Campus location where players can earn an Energy reward.',
        energy_reward: 1
      },
      {
        name: 'The Library',
        description: 'Campus location where players can earn an Energy reward.',
        energy_reward: 2
      },
      {
        name: 'The Social Hall',
        description: 'Campus location with a special perfect-score points multiplier.',
        energy_reward: 0
      },
      {
        name: 'ICT Building',
        description: 'Campus location for information and communications technology questions.',
        energy_reward: 0
      },
      {
        name: 'BME Building',
        description: 'Campus location for business, management, and economics questions.',
        energy_reward: 0
      },
      {
        name: 'CICT Building',
        description: 'Campus location for computing and information technology questions.',
        energy_reward: 0
      }
    ];

    const [existingLocations] = await queryInterface.sequelize.query(
      'SELECT name FROM locations'
    );

    const existingNames = new Set(
      existingLocations.map(location => location.name)
    );

    const newLocations = locations.filter(
      location => !existingNames.has(location.name)
    );

    if (newLocations.length > 0) {
      await queryInterface.bulkInsert('locations', newLocations);
    }

    console.log(`Seeded ${newLocations.length} new locations.`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('locations', {
      name: [
        'Admin Building',
        'Manggahan',
        'The Clinic',
        'The Library',
        'The Social Hall',
        'ICT Building',
        'BME Building',
        'CICT Building'
      ]
    });
  }
};

