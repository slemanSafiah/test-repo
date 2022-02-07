const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Appointment = require('./Appointment');
const User = require('../user/User');
const Service = require('../service/Services');
const Employee = require('../employee/Employee');

function getNewTime(start, total) {
	let addMin = (total - Math.floor(total)) * 60; //30
	if (addMin === 0) addMin = 0;
	else if (addMin > 0 && addMin <= 15) addMin = 15;
	else if (addMin > 15 && addMin <= 30) addMin = 30;
	else if (addMin > 30 && addMin <= 45) addMin = 45;
	else addMin = 60;
	let addHour = Math.floor(total); //1
	let time = start.split(':'); //['12 ' , ' 30']

	let startHour = parseInt(time[0]) + addHour; //12+1 = 13
	let startMin = parseInt(time[1]) + addMin; //30+30 = 60

	if (startMin >= 60) {
		startHour += Math.floor(startMin / 60);
		startMin -= 60 * Math.floor(startMin / 60);
	}
	return startHour + ' : ' + startMin;
}

class AppointmentService {
	constructor(data) {
		this.date = data.date;
		this.history = data.history;
		this.service = data.service;
		this.institution = data.institution;
		this.user = data.user;
		this.employee = data.employee;
	}

	async save() {
		const user = await User.findOne({ _id: this.user });
		if (!user) throw new Exception(httpStatus.CONFLICT, 'User not found');

		const employee = await Employee.find({ _id: this.employee });
		if (!employee) throw new Exception(httpStatus.CONFLICT, 'Employee not found');

		let servicePromise = await Promise.all(
			this.service.map((serv) => {
				return new Promise(async (resolve, reject) => {
					let service = await Service.findOne({ _id: serv }, 'length'); //1.5

					resolve(service.length);
				});
			})
		);

		let allServicesTimes = servicePromise.reduce((acc, curr) => {
			return (acc += curr);
		}, 0);

		let end = getNewTime(this.date, allServicesTimes);

		let appointment = await Appointment.find({
			employee: this.employee,
			history: this.history,
			date: { $gt: this.date },
		})
			.sort({ date: 1 })
			.limit(1);

		if (appointment.length > 0)
			if (appointment[0].date < end) throw new Exception(httpStatus.CONFLICT, "Appointment can't be reserved");

		const result = await new Appointment(this).save();
		if (!result) throw new Exception();
		return { data: { id: result.id } };
	}

	static async delete(id) {
		const result = await Appointment.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Appointment not found');
		return { msg: 'done' };
	}

	static async getById(id) {
		const result = await Appointment.findById(id)
			.populate('institution', 'openingDays name description address rating')
			.populate('employee', 'firstName lastName rating specialty')
			.populate('service', 'name description length price');
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Appointment not found');
		return { data: result };
	}

	static async getByCriteria(criteria, { limit, skip, total }) {
		let condition = (() => {
			let result = {};
			if (criteria.service) result['service'] = criteria.service;
			if (criteria.institution) result['institution'] = criteria.institution;
			if (criteria.user) result['user'] = criteria.user;
			if (criteria.employee) result['employee'] = criteria.employee;
			if (criteria.history) result['history'] = criteria.history;
			return result;
		})();
		const result = await Appointment.find(condition, '', { limit, skip })
			.populate('institution', 'openingDays name description address')
			.populate('employee', 'firstName lastName specialty')
			.populate('service', 'name description length price')
			.sort({ history: criteria.sort })
			.sort({ date: criteria.sort })
			.lean();
		let data = { data: result };
		if (total) {
			data.total = await Appointment.countDocuments({});
		}
		return data;
	}
}

module.exports = AppointmentService;
