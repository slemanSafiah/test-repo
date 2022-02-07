const handler = require('./handler');
const router = require('express').Router();
const { Exception, httpStatus } = require('../../../utils');
const validator = require('./validator');
const { auth } = require('../../../utils/token/authMiddleware');

/*********************************
 * @Router /api/private/template *
 *********************************/
router.put('/forgetPassword', Exception.generalErrorHandler(handler.forgetPasswordEmail));

router.put('/resetPassword/:token', Exception.generalErrorHandler(handler.resetPassword));

router.post('/', auth, validator.save, Exception.generalErrorHandler(handler.save));

router.put('/:id', auth, validator.update, Exception.generalErrorHandler(handler.update));

router.put('/:id/changePassword', auth, validator.paramId, Exception.generalErrorHandler(handler.changePassword));

router.put('/:id/photo', auth, validator.paramId, Exception.generalErrorHandler(handler.updatePhoto));

router.put('/:id/verify', auth, validator.paramId, Exception.generalErrorHandler(handler.verify));

router.delete('/:id/photo', auth, validator.paramId, Exception.generalErrorHandler(handler.deletePhoto));

router.delete('/:id', auth, validator.paramId, Exception.generalErrorHandler(handler.delete));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getById));

router.get('/', validator.getByCriteria, Exception.generalErrorHandler(handler.getByCriteria));

router.post('/signup', validator.save, Exception.generalErrorHandler(handler.signup));

router.post('/login', validator.login, Exception.generalErrorHandler(handler.login));

router.post('/contactUs', Exception.generalErrorHandler(handler.contactUs));

module.exports = router;
