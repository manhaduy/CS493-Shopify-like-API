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
exports.ProductSchema = ProductSchema;


/*
 * Executes a MySQL query to insert a new product into the database.  Returns
 * a Promise that resolves to the ID of the newly-created product entry.
 */
async function insertNewProduct(product) {
  product = extractValidFields(product, ProductSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO products SET ?',
    product
  );
  return result.insertId;
}
exports.insertNewProduct = insertNewProduct;

/*
 * Executes a MySQL query to fetch a single specified product based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * product.  If no product with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getProductById(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM products WHERE id = ?',
    [ id ]
  );
  return results[0];
}
exports.getProductById = getProductById;

/*
 * Executes a MySQL query to replace a specified product with new data.
 * Returns a Promise that resolves to true if the product specified by
 * `id` existed and was successfully updated or to false otherwise.
 */
async function replaceProductById(id, product) {
  product = extractValidFields(product, ProductSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE products SET ? WHERE id = ?',
    [ product, id ]
  );
  return result.affectedRows > 0;
}
exports.replaceProductById = replaceProductById;

/*
 * Executes a MySQL query to delete a product specified by its ID.  Returns
 * a Promise that resolves to true if the product specified by `id`
 * existed and was successfully deleted or to false otherwise.
 */
async function deleteProductById(id) {
  const [ result ] = await mysqlPool.query(
    'DELETE FROM products WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
}
exports.deleteProductById = deleteProductById;

/*
 * Executes a MySQL query to fetch all products for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested products.  This array could be empty if the
 * specified business does not have any products.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
async function getProductsByBusinessId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM products WHERE businessid = ?',
    [ id ]
  );
  return results;
}
exports.getProductsByBusinessId = getProductsByBusinessId;

/*
 * Executes a MySQL query to fetch all products by a specified user, based on
 * on the user's ID.  Returns a Promise that resolves to an array containing
 * the requested products.  This array could be empty if the specified user
 * does not have any products.  This function does not verify that the specified
 * user ID corresponds to a valid user.
 */
async function getProductsByCustomerId(id) {
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM products WHERE customerid = ?',
    [ id ]
  );
  return results;
}
exports.getProductsByCustomerId = getProductsByCustomerId;
