const { Seat, GameSession } = require('../models');

// The seat of one account in one session, or null. This one query is the rejoin rule.
function findSeat(sessionId, userId) {
  return Seat.findOne({ where: { session_id: sessionId, user_id: userId } });
}

function countBySession(sessionId) {
  return Seat.count({ where: { session_id: sessionId } });
}

// A seat of this account in a game that is being played right now, or null.
function findSeatInActiveGame(userId) {
  return Seat.findOne({
    where: { user_id: userId },
    include: [{ model: GameSession, where: { status: 'ACTIVE' }, required: true, attributes: [] }],
  });
}

// Nicknames only. Never the school ID, full name or email of another player.
function findAllBySession(sessionId) {
  return Seat.findAll({
    where: { session_id: sessionId },
    attributes: ['seat_id', 'nickname', 'joined_at'],
    order: [['seat_id', 'ASC']],
  });
}

function create(data) {
  return Seat.create(data);
}

module.exports = { findSeat, countBySession, findSeatInActiveGame, findAllBySession, create };