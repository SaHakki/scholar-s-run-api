const { matchedData } = require('express-validator');
const questionService = require('../services/question.service');

// What a HOST may see of a question. (Players must never get correct_choice.)
function toJson(question) {
  return {
    id: question.question_id,
    session_id: question.session_id,
    location_id: question.location_id,
    question_text: question.question_text,
    choice_a: question.choice_a,
    choice_b: question.choice_b,
    choice_c: question.choice_c,
    choice_d: question.choice_d,
    correct_choice: question.correct_choice,
  };
}

async function list(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const questions = await questionService.list(code, req.user);
  res.status(200).json(questions.map(toJson));
}

async function get(req, res) {
  const { code, questionId } = matchedData(req, { locations: ['params'] });
  const question = await questionService.get(code, questionId, req.user);
  res.status(200).json(toJson(question));
}

async function create(req, res) {
  const { code } = matchedData(req, { locations: ['params'] });
  const data = matchedData(req, { locations: ['body'] });
  const question = await questionService.create(code, data, req.user);
  res.status(201).json(toJson(question));
}

async function update(req, res) {
  const { code, questionId } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const question = await questionService.update(code, questionId, changes, req.user);
  res.status(200).json(toJson(question));
}

async function remove(req, res) {
  const { code, questionId } = matchedData(req, { locations: ['params'] });
  await questionService.remove(code, questionId, req.user);
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };