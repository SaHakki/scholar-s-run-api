'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;

    // 1. A second host, to prove that one host cannot touch another host's rows.
    const [secondHost] = await db.query(
      "SELECT user_id FROM users WHERE school_id = '2099-1006'"
    );
    if (secondHost.length === 0) {
      await queryInterface.bulkInsert('users', [{
        school_id: '2099-1006',
        full_name: 'Riley Mendoza',
        email: 'riley.mendoza@example.test',
        role: 'HOST',
      }]);
    }

    // 2. A game still in the lobby, owned by the first host, with no questions yet.
    const [[host]] = await db.query(
      "SELECT user_id FROM users WHERE school_id = '2099-1001'"
    );
    const [lobby] = await db.query(
      "SELECT session_id FROM game_sessions WHERE join_code = '472916'"
    );
    if (lobby.length === 0) {
      await queryInterface.bulkInsert('game_sessions', [{
        join_code: '472916',
        host_id: host.user_id,
        status: 'WAITING',
        duration_seconds: 720,
      }]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('game_sessions', { join_code: '472916' }, {});
    await queryInterface.bulkDelete('users', { school_id: '2099-1006' }, {});
  },
};