const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../utils/errorHandlers/Exception');
const validator = require('./validator');
const { auth } = require('../../../utils/token/authMiddleware');

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', auth, validator.save, Exception.generalErrorHandler(handler.addPlan));

router.put('/:id', auth, validator.update, Exception.generalErrorHandler(handler.updatePlan));

router.put('/:id/toggle', auth, validator.paramId, Exception.generalErrorHandler(handler.switchStatus));

router.delete('/:id', auth, validator.paramId, Exception.generalErrorHandler(handler.deletePlan));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getPlan));

router.get('/', Exception.generalErrorHandler(handler.getAllPlans));

module.exports = router;
