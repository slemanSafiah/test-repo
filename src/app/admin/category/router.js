const handler = require('./handler');
const router = require('express').Router();
const Exception = require('../../../../utils/errorHandlers/Exception');
const { auth } = require('../../../../utils/token/authMiddleware');

/*********************************
 * @Router /api/private/template *
 *********************************/

router.post('/', auth, Exception.generalErrorHandler(handler.save));

router.put('/:id', auth, Exception.generalErrorHandler(handler.update));

router.delete('/:id', auth, Exception.generalErrorHandler(handler.delete));

router.get('/:id', Exception.generalErrorHandler(handler.getById));

router.get('/', Exception.generalErrorHandler(handler.getAllCategories));

module.exports = router;
