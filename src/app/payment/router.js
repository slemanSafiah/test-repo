const router = require('express').Router();
const { httpStatus } = require('../../../utils');
const { auth } = require('../../../utils/token/authMiddleware');
const validator = require('./validator');
const paypal = require('paypal-rest-sdk');
const paymentObject = require('../../../utils/helper/preparePayment');
const Payment = require('./Payment');
const mongoose = require('mongoose');
const axios = require('axios');

paypal.configure({
	mode: process.env.MODE,
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
});

/*********************************
 * @Router /api/private/template *
 *********************************/

router.get('/success', async (req, res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;
	const payment = await Payment.findOne({ paymentId: paymentId });

	const data = {
		payer_id: payerId,
		transactions: [
			{
				amount: payment.data.amount,
			},
		],
	};

	const session = await mongoose.startSession();
	await session.withTransaction(async (session) => {
		await Payment.findOneAndUpdate(
			{ paymentId: paymentId },
			{ status: 'Done' },
			{ session, useFindAndModify: false }
		);
		paypal.payment.execute(paymentId, data, function (err, payment) {
			if (err) {
				throw err;
			}
			res.status(httpStatus.OK).json({ msg: 'payment is done successfully !! ' });
		});
	});
});

router.get('/cancel', auth, (req, res) => {
	res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ msg: 'an error occur in payment process' });
});

/**
 * @params id for the owner of institution
 * @body - institutionID and SKU
 */
router.post('/subscription/:id', auth, validator.checkout, validator.paramId, async (req, res) => {
	const data = await paymentObject.prepareSubscription(req.body);
	paypal;
	paypal.payment.create(data.pay, async function (err, payment) {
		if (err) throw err;

		const paymentId = payment.links[0].href.split('payment/')[1];
		const transaction = data.pay.transactions[0];

		const data2save = {
			paymentId: paymentId,
			user: req.params.id,
			institution: req.body.institution,
			data: transaction,
		};

		await Payment.create(data2save);

		for (let i = 0; i < payment.links.length; i++) {
			if (payment.links[i].rel === 'approval_url') {
				res.status(httpStatus.OK).json({ redirect_url: payment.links[i].href });
			}
		}
	});
});

/**
 * @params id for the user
 * @body  -institution and array of services
 */
router.post('/pay/:id', auth, validator.adaptivePayment, validator.paramId, async (req, res) => {
	const data = await paymentObject.preparePayment(req.body);
	const header = {
		'X-PAYPAL-SECURITY-USERID': process.env.USERIDPAYPAL,
		'X-PAYPAL-SECURITY-PASSWORD': process.env.PASSWORD,
		'X-PAYPAL-SECURITY-SIGNATURE': process.env.SIGNATURE,
		'X-PAYPAL-REQUEST-DATA-FORMAT': 'JSON',
		'X-PAYPAL-RESPONSE-DATA-FORMAT': 'JSON',
		'X-PAYPAL-APPLICATION-ID': process.env.APPLICATIONID,
		'X-PAYPAL-SERVICE-VERSION': '1.0.0',
	};
	console.log(header);
	const result = await axios({
		method: 'POST',
		url: 'https://svcs.sandbox.paypal.com/AdaptivePayments/Pay',
		headers: header,
		data: data,
	});
	if (result.data.responseEnvelope.ack === 'Success')
		return res.status(httpStatus.OK).json({
			red_url: `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=${result.data.payKey}`,
		});
	return res.status(httpStatus.BAD_REQUEST).json({ err: result.data.error });
});

module.exports = router;
