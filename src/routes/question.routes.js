const { Router } = require('express');
const controller = require('../controllers/question.controller');
const rules = require('../validators/question.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

// mergeParams lets this file see :code from the URL it is mounted under.
const router = Router({ mergeParams: true });

router.use(requireUser('HOST'));   // every endpoint in this file is for hosts

router.get('/', rules.listRules, validate, controller.list);
router.post('/', rules.createRules, validate, controller.create);
router.get('/:questionId', rules.getRules, validate, controller.get);
router.put('/:questionId', rules.updateRules, validate, controller.update);
router.delete('/:questionId', rules.deleteRules, validate, controller.remove);

module.exports = router;