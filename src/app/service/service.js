const { Exception, httpStatus } = require('../../../utils');
const Institution = require('../institution/Institution');
const Service = require('./Services');
const Plan = require('../plan/Plan');

class ServicesService {
	constructor(data) {
		this.name = data.name;
		this.institution = data.institution;
		this.category = data.category;
		this.description = data.description;
		this.length = data.length;
		this.price = data.price;
		this.atLeast = data.atLeast;
		this.retainer = data.retainer;
		this.hasRetainer = data.hasRetainer;
	}

	async save() {
		const institution = await Institution.findOne({ _id: this.institution }, 'subscription');

		if (!institution) throw new Exception(httpStatus.NOT_FOUND, 'institution not found');

		if (!institution.subscription.plan)
			throw new Exception(httpStatus.NOT_FOUND, 'you must subscribe a plan before add service');

		const plan = await Plan.findOne({ _id: institution.subscription.plan });

		const services = await Service.countDocuments({ institution: this.institution });

		if (services === plan.serviceLimit) {
			throw new Exception(
				httpStatus.BAD_REQUEST,
				'you have reach the limit to add new service , update subscription to be able to complete this process'
			);
		}

		const result = await new Service(this).save();

		if (!result) throw new Exception();

		return { data: { id: result.id } };
	}

	async update(id) {
		const result = await Service.findByIdAndUpdate(id, this, { omitUndefined: true });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return;
	}

	static async delete(id) {
		const result = await Service.findByIdAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return;
	}

	static async getById(id) {
		const result = await Service.findById(id).populate(
			'institution',
			'openingDays name description address rating'
		);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return { data: result };
	}

	static async getServices(id) {
		const result = await Service.find({ institution: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return { data: result };
	}

	static async getByCriteria(criteria, { limit, skip, total }) {
		let condition = (() => {
			let result = {};
			if (criteria.name) result['name'] = { $regex: criteria.name, $options: 'i' };
			if (criteria.cat) result['category'] = { $regex: criteria.cat, $options: 'i' };
			return result;
		})();
		const result = await Service.find(condition, '', { limit, skip }).sort({ name: criteria.sort }).lean();
		let data = { data: result };
		if (total) {
			data.total = await Service.countDocuments({});
		}
		return data;
	}
}

module.exports = ServicesService;
