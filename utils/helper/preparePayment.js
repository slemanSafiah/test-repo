const Institution = require('../../src/app/institution/Institution');
const Service = require('../../src/app/service/Services');
const Plan = require('../../src/app/plan/Plan');

exports.prepareSubscription = async (data) => {
	const plan = await Plan.findOne({ _id: data.id });

	const paymentObject = {
		pay: {
			intent: 'sale',
			payer: {
				payment_method: 'paypal',
			},
			redirect_urls: {
				return_url: 'http://localhost:5000/api/payment/success',
				cancel_url: 'http://localhost:5000/api/payment/failed',
			},
			transactions: [
				{
					item_list: {
						items: [
							{
								name: plan.name,
								sku: plan.sku,
								price: plan.price,
								currency: 'USD',
								quantity: 1,
							},
						],
					},
					amount: {
						currency: 'USD',
						total: plan.price,
					},
					description: plan.description,
				},
			],
		},
	};
	return paymentObject;
};

exports.preparePayment = async (data) => {
	const inst_id = data.institution;
	const inst_info = await Institution.findOne({ _id: inst_id }, 'paypalEmail hasRetainer retainer');

	const email = inst_info.paypalEmail;
	let tmp = 0;
	if (inst_info.hasRetainer) {
		tmp = inst_info.retainer;
	} else {
		const prices = await Promise.all(
			data.services.map((ser) => {
				return new Promise(async (resolve, reject) => {
					let res = await Service.findOne({ _id: ser });
					resolve(res.retainer);
				});
			})
		);
		tmp = prices.reduce((acc, curr) => {
			return acc + curr;
		}, 0);
	}

	const amount = tmp + '.00';
	console.log(email, amount);
	const res = {
		actionType: 'PAY',
		currencyCode: 'USD',
		receiverList: {
			receiver: [
				{
					amount: amount,
					email: email,
				},
			],
		},
		returnUrl: 'https://example.com/success.html',
		cancelUrl: 'https://example.com/failure.html',
		requestEnvelope: {
			errorLanguage: 'en_US',
			detailLevel: 'ReturnAll',
		},
	};
	return res;
};
