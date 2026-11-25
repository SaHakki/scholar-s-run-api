const { Question } = require('../models');

function findAllBySession(sessionId) {
  return Question.findAll({
    where: { session_id: sessionId },
    order: [['question_id', 'ASC']],
  });
}

// Looks inside ONE session, so a question id from another game is never found.
function findInSession(sessionId, questionId) {
  return Question.findOne({
    where: { session_id: sessionId, question_id: questionId },
  });
}

function create(data) {
  return Question.create(data);
}

function update(question, changes) {
  return question.update(changes);
}

function remove(question) {
  return question.destroy();
}

module.exports = { findAllBySession, findInSession, create, update, remove };