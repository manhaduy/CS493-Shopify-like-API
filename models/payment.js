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

/*
 * Executes a MySQL query to insert a new payment into the database.  Returns
 * a Promise that resolves to the ID of the newly-created payment entry.
 */
async function insertNewPayment(payment) {
  payment = extractValidFields(payment, PaymentSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO payments SET ?',
    payment
  );
  return result.insertId;
}
exports.insertNewPayment = insertNewPayment;

/*
 * Executes a MySQL query to fetch a single specified payment based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * payment.  If no payment with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getPaymentById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM payments WHERE id = ?',
    [ id ]
  );
  return results[0];
}
exports.getPaymentById = getPaymentById;

/*
 * Executes a MySQL query to replace a specified payment with new data.
 * Returns a Promise that resolves to true if the payment specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
async function replacePaymentById(id, payment) {
  payment = extractValidFields(payment, PaymentSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE payments SET ? WHERE id = ?',
    [ payment, id ]
  );
  return result.affectedRows > 0;
}
exports.replacePaymentById = replacePaymentById;

/*
 * Executes a MySQL query to delete a payment specified by its ID.  Returns
 * a Promise that resolves to true if the payment specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
async function deletePaymentById(id) {
  const [ result ] = await mysqlPool.query(
    'DELETE FROM payments WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
}
exports.deletePaymentById = deletePaymentById;

/*
 * Executes a MySQL query to fetch all payments for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested payments.  This array could be empty if the
 * specified business does not have any payments.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
async function getPaymentsByBusinessId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM payments WHERE businessid = ?',
    [ id ]
  );
  return results;
}
exports.getPaymentsByBusinessId = getPaymentsByBusinessId;

/*
 * Executes a MySQL query to fetch all payments by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested payments.  This array could be empty if the specified user
 * does not have any payments.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
async function getPaymentsByCustomerId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM payments WHERE customerid = ?',
    [ id ]
  );
  return results;
}
exports.getPaymentsByCustomerId = getPaymentsByCustomerId;
