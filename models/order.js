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
  productid: { required: true },
  time: { required: true },
  items: { required: true },
  totalprice: { required: true },
  shippingstatus: { required: true },
  paymentstatus: { required: true }
};
exports.OrderSchema = OrderSchema;

/*
 * Executes a MySQL query to insert a new order into the database.  Returns
 * a Promise that resolves to the ID of the newly-created order entry.
 */
async function insertNewOrder(order) {
  order = extractValidFields(order, OrderSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO orders SET ?',
    order
  );
  return result.insertId;
}
exports.insertNewOrder = insertNewOrder;

/*
 * Executes a MySQL query to fetch a single specified order based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * order.  If no order with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getOrderById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM orders WHERE id = ?',
    [ id ]
  );
  return results[0];
}
exports.getOrderById = getOrderById;

/*
 * Executes a MySQL query to replace a specified order with new data.
 * Returns a Promise that resolves to true if the order specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
async function replaceOrderById(id, order) {
  order = extractValidFields(order, OrderSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE orders SET ? WHERE id = ?',
    [ order, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceOrderById = replaceOrderById;

/*
 * Executes a MySQL query to delete a order specified by its ID.  Returns
 * a Promise that resolves to true if the order specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
async function deleteOrderById(id) {
  const [ result ] = await mysqlPool.query(
    'DELETE FROM orders WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
}
exports.deleteOrderById = deleteOrderById;

/*
 * Executes a MySQL query to fetch all orders for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested orders.  This array could be empty if the
 * specified business does not have any orders.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
async function getOrdersByBusinessId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM orders WHERE businessid = ?',
    [ id ]
  );
  return results;
}
exports.getOrdersByBusinessId = getOrdersByBusinessId;

/*
 * Executes a MySQL query to fetch all orders by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested orders.  This array could be empty if the specified user
 * does not have any orders.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
async function getOrdersByCustomerId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM orders WHERE customerid = ?',
    [ id ]
  );
  return results;
}
exports.getOrdersByCustomerId = getOrdersByCustomerId;
