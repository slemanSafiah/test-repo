const { Exception, httpStatus } = require('../../../../utils');
const Category = require('./Category');
const paths = require('../../../../paths');
const fs = require('fs').promises;

async function uploadImage(photo) {
	let image = Buffer.from(photo, 'base64');
	let fileName = Date.now().toString() + '.jpg';
	await fs.writeFile(`./uploads/category/${fileName}`, image);
	return `/uploads/category/${fileName}`;
}

class CategoryService {
	constructor(data) {
		this.name = data.name;
		this.image = data.image;
	}

	async save() {
		if (this.image) {
			this.image = await uploadImage(this.image);
		}
		const result = await new Category(this).save();
		if (!result) throw new Exception();
		return { data: { id: result._id } };
	}

	async update(id) {
		const category = await Category.findOne({ _id: id });
		if (!category) throw new Exception(httpStatus.CONFLICT, 'Category not found');
		if (this.image) this.image = await uploadImage(this.image);

		const result = await Category.findOneAndUpdate({ _id: id }, this, {
			omitUndefined: true,
			useFindAndModify: false,
			new: false,
		});
		if (!result) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'Error in update Category data');
		if (result.image) await fs.unlink(`${paths.app}/${result.image}`);

		return { data: result };
	}

	static async delete(id) {
		const result = await Category.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Category not found');
		return { msg: 'done' };
	}

	static async getById(id) {
		//FIXME
		const result = await Category.findById(id);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Category not found');
		result.image = `http://161.35.193.253/media2/${result.image.slice(9)}`;
		return { data: result };
	}

	static async getAllCategories() {
		//FIXME
		const result = await Category.find({});
		if (result.length === 0) throw new Exception(httpStatus.NOT_FOUND, 'no categories found');
		let data = await Promise.all(
			result.map((cat) => {
				return new Promise(async (resolve, reject) => {
					if (cat.image) cat.image = `http://161.35.193.253/media2/${cat.image.slice(9)}`;
					resolve(cat);
				});
			})
		);
		return { data };
	}
}

module.exports = CategoryService;
