const bcrypt = require('bcryptjs');

/*
 * Business schema and data accessor methods;
 */
const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');


/*
 * Schema describing required/optional fields of a user object.
 */
const CustomerSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    admin: { required: false}
};
  exports.CustomerSchema = CustomerSchema;


async function insertNewCustomer(customer) {
    customer = extractValidFields(customer, CustomerSchema);

    const passwordHash = await bcrypt.hash(customer.password, 8);
    customer.password = passwordHash;

    const [ result ] = await mysqlPool.query(
        'INSERT INTO customers SET ?',
        customer
    );

return result.insertId;
}
exports.insertNewCustomer = insertNewCustomer;


async function getCustomerById(id, includePassword){

    const [results] = includePassword ? await mysqlPool.query(
        'SELECT * FROM customers WHERE id = ?',
        [ id ]
    ) : await mysqlPool.query(
        'SELECT name, email FROM customers WHERE id = ?',
        [ id ]
    );
    return results[0];
}
exports.getCustomerById=getCustomerById;


async function getCustomerByEmail(email){
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM customers WHERE email = ?',
        [ email ]
    );

    return results[0];
}
exports.getCustomerByEmail = getCustomerByEmail;


exports.validateCustomer = async function(id, password){
    const customer = await exports.getCustomerById(id, true);
    return customer && await bcrypt.compare(password, customer.password);
};

exports.validateCustomerEmail = async function(email, password){
    const customer = await exports.getCustomerByEmail(email);
    return customer && await bcrypt.compare(password, customer.password);
};

exports.validateCustomerIdCombo = async function(email, id){
    const customer = await exports.getCustomerById(id);
    return (customer.email == email);
};
