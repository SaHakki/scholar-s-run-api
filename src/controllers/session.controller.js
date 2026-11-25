const { matchedData } = require('express-validator');
const sessionService = require('../services/session.service');

// The code is what players type. The numeric id and the host's id stay inside.
function toJson(session) {
  return {
    code: session.join_code,
    status: session.status,
    duration_seconds: session.duration_seconds,
    started_at: session.started_at,
    ends_at: session.ends_at,
    created_at: session.created_at,
  };
}

async function create(req, res) {
  const session = await sessionService.create(req.user);
  res.status(201).json(toJson(session));
}

async function get(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const session = await sessionService.get(code);
  res.status(200).json(toJson(session));
}

async function changeStatus(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const { status } = matchedData(req, { locations: ['body'] });
  const session = await sessionService.changeStatus(code, status, req.user);
  res.status(200).json(toJson(session));
}

module.exports = { create, get, changeStatus };