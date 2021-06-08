/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  ProductSchema,
  insertNewProduct,
  getProductById,
  replaceProductById,
  deleteProductById,
  getProductsByBusinessId
} = require('../models/product');

const {requireAuthentication} = require('../lib/auth');
const {validateCustomerIdEmail} = require('../models/customer');
/*
 * Route to create a new product.
 */
router.post('/', requireAuthentication, async (req, res) => {
  if (validateAgainstSchema(req.body, ProductSchema)) {
      /*
       * Make sure the user is not trying to product the same business twice.
       * If they're not, then insert their product into the DB.
       */
       //Try to validate
       try {
         const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
  //       if(!authorizedSearch){ && !req.admin){
  if(!authorizedSearch){
           res.status(403).send({
             error: "Unauthorized to access the specific resource"
           })
         } else {



       try{
      const alreadyAddProduct = await hasCustomerProductedBusiness(req.body.customerid, req.body.businessid);
      if (alreadyAddProduct) {
        res.status(403).send({
          error: "Customer has already posted a product of this business"
        });
      } else {
        const id = await insertNewProduct(req.body);
        res.status(201).send({
          id: id,
          links: {
            product: `/products/${id}`,
            business: `/businesses/${req.body.businessid}`
          }
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting product into DB.  Please try again later."
      });
    }
}

} catch (err) {
  console.error(err);
  res.status(500).send({
    error: "Unable to validate customer id.  Please try again later."
  });
}



  } else {
    res.status(400).send({
      error: "Request body is not a valid product object."
    });
  }


});

/*
 * Route to fetch info about a specific product.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductById(parseInt(req.params.id));
    if (product) {
      res.status(200).send(product);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch product.  Please try again later."
    });
  }
});

/*
 * Route to update a product.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  if (validateAgainstSchema(req.body, ProductSchema)) {
    try {
      /*
       * Make sure the updated product has the same businessID and userID as
       * the existing product.  If it doesn't, respond with a 403 error.  If the
       * product doesn't already exist, respond with a 404 error.
       */
      const id = parseInt(req.params.id);
      const existingProduct = await getProductById(id);
      if (existingProduct) {
        try{
              //Try to validate user email
            const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
            if(!authorizedSearch){
              res.status(403).send({
                error: "Unauthorized to access the specific resource"
              })
            } else {


        if (req.body.businessid === existingProduct.businessid && req.body.customerid === existingProduct.customerid) {
          const updateSuccessful = await replaceProductById(id, req.body);
          if (updateSuccessful) {
            res.status(200).send({
              links: {
                business: `/businesses/${req.body.businessid}`,
                product: `/products/${id}`
              }
            });
          } else {
            next();
          }
        } else {
          res.status(403).send({
            error: "Updated product must have the same businessID and customerID"
          });
        }
}

        //user id
        } catch (err) {
          console.error(err);
          res.status(500).send({
            error: "Unable to validate customer id.  Please try again later."
          });
        }




      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update product.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid product object."
    });
  }
});

/*
 * Route to delete a product.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  try {
    /*
     * Make sure the updated product has the same businessID and userID as
     * the existing product.  If it doesn't, respond with a 403 error.  If the
     * product doesn't already exist, respond with a 404 error.
     */
    const id = parseInt(req.params.id);
    const existingProduct = await getProductById(id);
    if (existingProduct) {
      try{
            //Try to validate user email
          const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
          if(!authorizedSearch){
            res.status(403).send({
              error: "Unauthorized to access the specific resource"
            })
          } else {

  try {
    const deleteSuccessful = await deleteProductById(parseInt(req.params.id));
    if (deleteSuccessful) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete product.  Please try again later."
    });
  }
}

  //user id
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to validate customer id.  Please try again later."
    });
  }
}
} catch (err) {
  console.error(err);
  res.status(500).send({
    error: "Unable to deletee product with this id.  Please try again later."
  });
}
});

module.exports = router;
