
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT
      gs.join_code AS session_code,
      gs.started_at AS started_at,
      gs.ends_at AS ended_at,
      u.school_id AS school_id,
      s.nickname AS nickname,
      r.final_score AS score,
      (r.status = 'FINISHED') AS completed
    FROM game_sessions gs
    JOIN seats s
      ON s.session_id = gs.session_id
    JOIN users u
      ON u.user_id = s.user_id
    JOIN runs r
      ON r.seat_id = s.seat_id
    WHERE gs.status = 'FINISHED'
      AND gs.ends_at IS NOT NULL
      AND (
        CAST(:since AS timestamptz) IS NULL
        OR gs.ends_at > CAST(:since AS timestamptz)
      )
    ORDER BY gs.ends_at, r.final_score DESC
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      since: since ? since.toISOString() : null,
    },
  });
}

module.exports = { findFinishedGamePlayers };

