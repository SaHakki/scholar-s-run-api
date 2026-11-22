const sessionRepository = require('../repositories/session.repository');
const playerRepository = require('../repositories/player.repository');
const { notFound, forbidden, conflict } = require('../errors/app-error');
const { constraintOf } = require('../errors/db-errors');
const gameInfo = require('../config/game-info');

// Hub Contract rule 5: six digits. 100000 to 999999 never starts with 0.
function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Rule: which status may follow which. A finished game never runs again.
const NEXT_STATUS = {
  WAITING: ['ACTIVE'],
  ACTIVE: ['FINISHED'],
  FINISHED: [],
};

async function findOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) {
    throw notFound('SESSION_NOT_FOUND', `No game has the code ${code}.`);
  }
  return session;
}

// The server makes the code. A random code can already be in use: the UNIQUE
// constraint on join_code tells us, and we try again.
async function create(user) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await sessionRepository.create({
        host_id: user.user_id,
        join_code: randomCode(),
        status: 'WAITING',
      });
    } catch (error) {
      if (constraintOf(error) !== 'game_sessions_join_code_key') throw error;
    }
  }
  throw new Error('Could not find a free join code after 5 attempts.');
}

function get(code) {
  return findOrFail(code);
}

async function changeStatus(code, status, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id) {
    throw forbidden('This game belongs to another host.');
  }
  if (!NEXT_STATUS[session.status].includes(status)) {
    throw conflict('INVALID_STATUS_CHANGE', `A ${session.status} game cannot become ${status}.`);
  }

  const now = new Date();
  const changes = { status };

  if (status === 'ACTIVE') {
    const seated = await playerRepository.countBySession(session.session_id);
    if (seated < gameInfo.min_players) {
      throw conflict(
        'NOT_ENOUGH_PLAYERS',
        `At least ${gameInfo.min_players} players must join before the game can start.`
      );
    }
    changes.started_at = now;
    changes.ends_at = new Date(now.getTime() + session.duration_seconds * 1000);
  }
  if (status === 'FINISHED') {
    changes.ends_at = now; // the moment it really ended
  }

  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, get, changeStatus };