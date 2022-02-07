const { Exception, httpStatus } = require('../../../utils');
const Plan = require('./Plan');

class PlanService {
	constructor(data) {
		this.sku = data.sku;
		this.name = data.name;
		this.price = data.price;
		this.description = data.description;
		this.employeeLimit = data.employeeLimit;
		this.serviceLimit = data.serviceLimit;
		this.length = data.length;
		this.status = data.status;
		this.available = data.available;
	}

	async addPlan() {
		const plan = await Plan.findOne({ sku: this.sku });
		if (plan) throw new Exception(httpStatus.CONFLICT, 'Plan already exists');

		const result = await new Plan(this).save();
		if (!result) throw new Exception();

		return { data: { id: result._id } };
	}

	async updatePlan(id) {
		const plan = await Plan.findOneAndUpdate({ _id: id }, this, { omitUndefined: true });
		if (!plan) throw new Exception(httpStatus.NOT_FOUND, 'Plan are not exists');
		return;
	}

	static async switchStatus(id) {
		const plan = await Plan.findOne({ _id: id });
		if (!plan) throw new Exception(httpStatus.NOT_FOUND, 'Plan are not exists');
		const result = await Plan.updateOne({ _id: id }, { $set: { available: !plan.available } }, { new: true });
		if (!result.nModified) throw new Exception();

		return;
	}

	static async deletePlan(id) {
		const plan = await Plan.findOneAndDelete({ _id: id });
		if (!plan) throw new Exception(httpStatus.NOT_FOUND, 'Plan are not exists');
		return;
	}

	static async getPlan(id) {
		const plan = await Plan.findOne({ _id: id });
		if (!plan) throw new Exception(httpStatus.NOT_FOUND, 'Plan are not exists');
		return { result: plan };
	}

	static async getAllPlans() {
		const plans = await Plan.find();
		if (plans.length === 0) throw new Exception(httpStatus.NOT_FOUND, 'There is no plans for now');
		return plans;
	}
}

module.exports = PlanService;
