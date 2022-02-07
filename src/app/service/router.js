const Exception = require('../../../utils/errorHandlers/Exception');
const handler = require('./handler');
const router = require('express').Router();
const validator = require('./validator');
const { auth } = require('../../../utils/token/authMiddleware');

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', auth, validator.save, Exception.generalErrorHandler(handler.save));

router.put('/:id', auth, validator.update, Exception.generalErrorHandler(handler.update));

router.delete('/:id', auth, validator.paramId, Exception.generalErrorHandler(handler.delete));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getById));

router.get('/:id/all', validator.paramId, Exception.generalErrorHandler(handler.getServices));

router.get('/', validator.getByCriteria, Exception.generalErrorHandler(handler.getByCriteria));

module.exports = router;
