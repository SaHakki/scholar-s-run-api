const sessionRepository = require('../repositories/session.repository');
const locationRepository = require('../repositories/location.repository');
const questionRepository = require('../repositories/question.repository');
const { notFound, forbidden, conflict } = require('../errors/app-error');

// Rules of the questions module:
//  1. The game named in the URL must exist                 -> 404 SESSION_NOT_FOUND
//  2. Only the host who owns the game may touch its questions -> 403
//  3. Questions can only change while the game is WAITING   -> 409 SESSION_NOT_EDITABLE
//  4. A question must point to a real location              -> 404 LOCATION_NOT_FOUND
//  5. A question id must belong to the game in the URL      -> 404 QUESTION_NOT_FOUND
//  6. The owner is the caller: a client never chooses host_id or session_id.

async function findSessionOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) {
    throw notFound('SESSION_NOT_FOUND', `No game has the code ${code}.`);
  }
  return session;
}

function assertOwner(session, user) {
  if (session.host_id !== user.user_id) {
    throw forbidden('This game belongs to another host.');
  }
}

function assertEditable(session) {
  if (session.status !== 'WAITING') {
    throw conflict(
      'SESSION_NOT_EDITABLE',
      'Questions can only be changed while the game is waiting for players.'
    );
  }
}

async function assertLocationExists(locationId) {
  const location = await locationRepository.findById(locationId);
  if (!location) {
    throw notFound('LOCATION_NOT_FOUND', `No campus location has the id ${locationId}.`);
  }
}

async function findQuestionOrFail(session, questionId) {
  const question = await questionRepository.findInSession(session.session_id, questionId);
  if (!question) {
    throw notFound('QUESTION_NOT_FOUND', `This game has no question with the id ${questionId}.`);
  }
  return question;
}

async function list(code, user) {
  const session = await findSessionOrFail(code);
  assertOwner(session, user);
  return questionRepository.findAllBySession(session.session_id);
}

async function get(code, questionId, user) {
  const session = await findSessionOrFail(code);
  assertOwner(session, user);
  return findQuestionOrFail(session, questionId);
}

async function create(code, data, user) {
  const session = await findSessionOrFail(code);
  assertOwner(session, user);
  assertEditable(session);
  await assertLocationExists(data.location_id);
  return questionRepository.create({ ...data, session_id: session.session_id });
}

async function update(code, questionId, changes, user) {
  const session = await findSessionOrFail(code);
  assertOwner(session, user);
  assertEditable(session);
  const question = await findQuestionOrFail(session, questionId);
  if (changes.location_id !== undefined) {
    await assertLocationExists(changes.location_id);
  }
  return questionRepository.update(question, changes);
}

async function remove(code, questionId, user) {
  const session = await findSessionOrFail(code);
  assertOwner(session, user);
  assertEditable(session);
  const question = await findQuestionOrFail(session, questionId);
  await questionRepository.remove(question);
}

module.exports = { list, get, create, update, remove };