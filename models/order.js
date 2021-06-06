/*
 * Review schema and data accessor methods.
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const OrderSchema = {
  orderid: { required: true },
  customerid: { required: true },
  time: { required: true },
  items: { required: true },
  totalprice: { required: true },
  shippingstatus: { required: true },
  paymentstatus: { required: true }
};
exports.OrderSchema = OrderSchema;
