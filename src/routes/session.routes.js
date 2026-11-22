const { Router } = require('express');
const sessionController = require('../controllers/session.controller');
const playerController = require('../controllers/player.controller');
const rules = require('../validators/session.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();

router.post('/', requireUser('HOST'), sessionController.create);
router.get('/:code', requireUser(), rules.codeParam, validate, sessionController.get);
router.patch('/:code', requireUser('HOST'), rules.statusRules, validate, sessionController.changeStatus);

// Players are a part of a session, so their URLs sit under it.
router.post('/:code/players', requireUser(), rules.joinRules, validate, playerController.join);
router.get('/:code/players', requireUser(), rules.codeParam, validate, playerController.list);

module.exports = router;