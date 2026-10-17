'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const accounts = [
      {
        school_id: '2099-1001',
        full_name: 'Alex Rivera',
        email: 'alex.rivera@example.test',
        role: 'HOST'
      },
      {
        school_id: '2099-1002',
        full_name: 'Jamie Santos',
        email: 'jamie.santos@example.test',
        role: 'PLAYER'
      },
      {
        school_id: '2099-1003',
        full_name: 'Taylor Cruz',
        email: 'taylor.cruz@example.test',
        role: 'PLAYER'
      },
      {
        school_id: '2099-1004',
        full_name: 'Morgan Reyes',
        email: 'morgan.reyes@example.test',
        role: 'PLAYER'
      },
      {
        school_id: '2099-1005',
        full_name: 'Casey Flores',
        email: 'casey.flores@example.test',
        role: 'PLAYER'
      }
    ];

    const [existingUsers] = await queryInterface.sequelize.query(
      'SELECT school_id FROM users'
    );

    const existingSchoolIds = new Set(
      existingUsers.map(user => user.school_id)
    );

    const newAccounts = accounts.filter(
      account => !existingSchoolIds.has(account.school_id)
    );

    if (newAccounts.length > 0) {
      await queryInterface.bulkInsert('users', newAccounts);
    }

    console.log(`Seeded ${newAccounts.length} new accounts.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'users',
      {
        school_id: {
          [Sequelize.Op.in]: [
            '2099-1001',
            '2099-1002',
            '2099-1003',
            '2099-1004',
            '2099-1005'
          ]
        }
      }
    );
  }
};

