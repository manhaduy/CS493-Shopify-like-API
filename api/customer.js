const router = require('express').Router();

const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByCustomerId } = require('../models/review');
const { getPhotosByCustomerId } = require('../models/photo');

const { validateAgainstSchema } = require('../lib/validation');
const {
  CustomerSchema,
  insertNewCustomer,
  getCustomerById,
  validateCustomerEmail,
  validateCustomerIdEmail,
  validateCustomer
} = require('../models/customer');

const { generateAuthToken, requireAuthentication } = require('../lib/auth');
/*
 * Route to list all of a customer's businesses.
 */
router.get('/:id/businesses', async (req, res, next) => {

//Try to validate
try {
  const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
  if(!authorizedSearch){
    res.status(403).send({
      error: "Unauthorized to access the specific resource"
    })
  } else {

  //else success
  try {
    const businesses = await getBusinessesByOwnerId(parseInt(req.params.id));
    if (businesses) {
      res.status(200).send({ businesses: businesses });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch businesses.  Please try again later."
    });
  }
}

} catch (err) {
  console.error(err);
  res.status(500).send({
    error: "Unable to validate customers id.  Please try again later."
  });
}


});

/*
 * Route to list all of a customer's reviews.
 */
router.get('/:id/reviews', async (req, res, next) => {
  //Try to validate
  try {
    const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
    if(!authorizedSearch){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {


  try {
    const reviews = await getReviewsByCustomerId(parseInt(req.params.id));
    if (reviews) {
      res.status(200).send({ reviews: reviews });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch reviews.  Please try again later."
    });
  }
}
//Otherwise catch error
} catch (err) {
  console.error(err);
  res.status(500).send({
    error: "Unable to validate customers id.  Please try again later."
  });
}

});

/*
 * Route to list all of a Customer's photos.
 */
router.get('/:id/photos', async (req, res, next) => {
  //Try to validate
  try {
    const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
    if(!authorizedSearch){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {

  try {
    const photos = await getPhotosByCustomerId(parseInt(req.params.id));
    if (photos) {
      res.status(200).send({ photos: photos });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photos.  Please try again later."
    });
  }
}

} catch (err){
  res.status(500).send({
    error: "Unable to validate customers id for logged in customers. Try again later."
  });
}

});

/*
 * Route to add a new Customer.
 */

router.post('/',  async (req, res, next) =>{
  if (validateAgainstSchema(req.body, CustomerSchema)) {

    try {
      const id = await insertNewCustomer(req.body);
      res.status(201).send({
        id: id,
        links: {
          customer: `/customers/${id}`,

        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting customer into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid customers object."
    });
  }
});

/*
 * Route to get a customer by ID.
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {

  try {
    const emailIdMatch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
    if(!emailIdMatch){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {
      try {
        const customer = await getCustomerById(parseInt(req.params.id), 0);
        if (customer) {
          res.status(200).send(customer);
        } else {
          next();
        }
      } catch (err) {
        console.error("-- Error:", err);
        res.status(500).send({
          error: "Unable to fetch customers.  Please try again later."
        });
      }
    }
  } catch (err){
    res.status(500).send({
      error: "Unable to validate customer id for logged in customers. Try again later."
    });
  }


});



/*
 * Route to allow JWT-based customer logins
 */

router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const emailPassMatch = await validateCustomerEmail(
        req.body.email,
        req.body.password
      );
      if (emailPassMatch) {
        try {
          const token = generateAuthToken(req.body.email);
          res.status(200).send({
            token: token
          });
        } catch (err){
          res.status(500).send({
            error: "Could not perform customer validation."
          });
        }
      } else {
        res.status(401).send({
          error: "Invalid authentication credentials"
        });
      }


    } catch (err) {
      res.status(500).send({
        error: "Error logging in.  Try again later."
      });
    }
  } else {
    res.status(400).json({
      error: "Request body needs customer ID and password."
    });
  }

});

module.exports = router;
