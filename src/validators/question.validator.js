const { body, param } = require('express-validator');

// Values in the URL
const codeParam = param('code')
  .matches(/^\d{6}$/).withMessage('code must be exactly 6 digits');

const questionIdParam = param('questionId')
  .isInt({ min: 1 }).withMessage('questionId must be a positive whole number')
  .toInt();

// Fields in the body. Rules are at least as strict as the columns.
const text = (field, min, max) => () => body(field)
  .exists().withMessage(`${field} is required`)
  .bail()
  .isString().withMessage(`${field} must be text`)
  .bail()
  .trim()
  .isLength({ min, max }).withMessage(`${field} must be ${min} to ${max} characters long`);

const questionText = text('question_text', 5, 500);
const choiceA = text('choice_a', 1, 200);
const choiceB = text('choice_b', 1, 200);
const choiceC = text('choice_c', 1, 200);
const choiceD = text('choice_d', 1, 200);

const locationId = () => body('location_id')
  .exists().withMessage('location_id is required')
  .bail()
  .isInt({ min: 1 }).withMessage('location_id must be a positive whole number')
  .toInt();

const correctChoice = () => body('correct_choice')   // CHECK IN ('A','B','C','D')
  .exists().withMessage('correct_choice is required')
  .bail()
  .isString().withMessage('correct_choice must be text')
  .bail()
  .trim()
  .toUpperCase()
  .isIn(['A', 'B', 'C', 'D']).withMessage('correct_choice must be A, B, C or D');

const fields = () => [
  locationId(), questionText(), choiceA(), choiceB(), choiceC(), choiceD(), correctChoice(),
];

const listRules = [codeParam];
const getRules = [codeParam, questionIdParam];
const createRules = [codeParam, ...fields()];
// PUT replaces the whole question, so every field is required again.
const updateRules = [codeParam, questionIdParam, ...fields()];
const deleteRules = getRules;

module.exports = { listRules, getRules, createRules, updateRules, deleteRules };