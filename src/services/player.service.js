const sessionService = require('./session.service');
const playerRepository = require('../repositories/player.repository');
const { conflict } = require('../errors/app-error');
const { constraintOf } = require('../errors/db-errors');
const gameInfo = require('../config/game-info');

// Joining, in a fixed order. The first "no" decides the answer.
//  1. Does the game exist?                          -> 404
//  2. Does this account already have a seat here?   -> 200, the same seat (rejoin)
//  3. Is the game still waiting for players?        -> else 409
//  4. Is this account busy in another active game?  -> 409
//  5. Is there room (max players)?                  -> else 409
//  6. Create the seat                               -> 201
async function join(code, nickname, user) {
  const session = await sessionService.findOrFail(code);

  // Rejoin: found by ACCOUNT, not by nickname. Same row, whatever nickname was typed.
  const seat = await playerRepository.findSeat(session.session_id, user.user_id);
  if (seat) return { session, seat, created: false };

  if (session.status === 'FINISHED') {
    throw conflict('SESSION_ENDED', 'This game has ended.');
  }
  if (session.status !== 'WAITING') {
    throw conflict('SESSION_NOT_JOINABLE', 'This game has already started.');
  }

  const busy = await playerRepository.findSeatInActiveGame(user.user_id);
  if (busy) {
    throw conflict('ALREADY_IN_ACTIVE_GAME', 'This account is already playing in another game.');
  }

  const seated = await playerRepository.countBySession(session.session_id);
  if (seated >= gameInfo.max_players) {
    throw conflict('SESSION_FULL', 'This game is full.');
  }

  try {
    const created = await playerRepository.create({
      session_id: session.session_id,
      user_id: user.user_id,
      nickname,
    });
    return { session, seat: created, created: true };
  } catch (error) {
    // The same account sent two join requests at the same instant and the other one won.
    if (constraintOf(error) === 'uq_seats_session_user') {
      const existing = await playerRepository.findSeat(session.session_id, user.user_id);
      return { session, seat: existing, created: false };
    }
    throw error; // a taken nickname reaches the error handler and answers 409
  }
}

async function list(code) {
  const session = await sessionService.findOrFail(code);
  return playerRepository.findAllBySession(session.session_id);
}

module.exports = { join, list };