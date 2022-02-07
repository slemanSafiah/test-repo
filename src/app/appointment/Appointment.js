const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppointmentSchema = new Schema(
	{
		_id: { type: Schema.ObjectId, auto: true },
		date: { type: String, required: true },
		history: { type: Number, required: true },
		service: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Service' }],
		institution: { type: mongoose.Types.ObjectId, required: true, ref: 'Institution' },
		user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
		employee: { type: mongoose.Types.ObjectId, required: true, ref: 'Employee' },
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const Appointment = mongoose.model('Appointment', AppointmentSchema, 'Appointments');

module.exports = Appointment;
