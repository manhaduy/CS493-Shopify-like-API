/*
 * Review schema and data accessor methods.
 */

const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const PaymentSchema = {
  orderid: { required: true },
  customerid: { required: true },
  paymentid: { required: true },
  paymentamount: { required: true }
};
exports.ReviewSchema = PaymentSchema;
