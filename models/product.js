/*
 * Review schema and data accessor methods.
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const ProductSchema = {
  productid: { required: true },
  name: { required: true },
  category: { required: true },
  description: { required: true },
  price: { required: true },
  photo: { required: false }
};
exports.ReviewSchema = ProductSchema;
