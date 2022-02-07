const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlanSchema = new Schema(
	{
		_id: { type: Schema.ObjectId, auto: true },
		name: { type: String, required: true },
		sku: { type: String, required: true, unique: true },
		description: { type: String, required: true },
		price: { type: String, required: true },
		employeeLimit: { type: Number, required: true },
		serviceLimit: { type: Number, required: true },
		length: { type: Number, required: true },
		available: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const Plan = mongoose.model('Plan', PlanSchema, 'Plans');

module.exports = Plan;
