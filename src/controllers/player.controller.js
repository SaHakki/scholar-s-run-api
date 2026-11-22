const { matchedData } = require('express-validator');
const playerService = require('../services/player.service');

async function join(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const { nickname } = matchedData(req, { locations: ['body'] });
  const { session, seat, created } = await playerService.join(code, nickname, req.user);

  // 201 Created for a new seat, 200 OK when the account already had one (rejoin).
  res.status(created ? 201 : 200).json({
    seat_id: seat.seat_id,
    nickname: seat.nickname,
    rejoined: !created,
    session: {
      code: session.join_code,
      status: session.status,
      started_at: session.started_at,
      ends_at: session.ends_at,
    },
  });
}

async function list(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const seats = await playerService.list(code);
  res.status(200).json(
    seats.map((seat) => ({
      seat_id: seat.seat_id,
      nickname: seat.nickname,
      joined_at: seat.joined_at,
    }))
  );
}

module.exports = { join, list };