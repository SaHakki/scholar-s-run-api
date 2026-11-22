const { body, param } = require('express-validator');

// Hub Contract rule 5: a join code is six digits and does not start with 0.
const codeParam = param('code')
  .matches(/^[1-9][0-9]{5}$/).withMessage('the join code must be six digits');

// Only the values a client may ASK for. The service decides if the change is allowed.
const statusRules = [
  codeParam,
  body('status')
    .exists().withMessage('status is required')
    .bail()
    .isString().withMessage('status must be text')
    .bail()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'FINISHED']).withMessage('status must be ACTIVE or FINISHED'),
];

const joinRules = [                      // nickname VARCHAR(50) NOT NULL
  codeParam,
  body('nickname')
    .exists().withMessage('nickname is required')
    .bail()
    .isString().withMessage('nickname must be text')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('nickname must be 2 to 50 characters long'),
];

module.exports = { codeParam, statusRules, joinRules };