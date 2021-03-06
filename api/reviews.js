/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  ReviewSchema,
  hasCustomerReviewedBusiness,
  insertNewReview,
  getReviewById,
  replaceReviewById,
  deleteReviewById
} = require('../models/review');

const {requireAuthentication} = require('../lib/auth');
const {validateCustomerIdEmail} = require('../models/customer');
/*
 * Route to create a new review.
 */
router.post('/', requireAuthentication, async (req, res) => {
  if (validateAgainstSchema(req.body, ReviewSchema)) {
      /*
       * Make sure the user is not trying to review the same business twice.
       * If they're not, then insert their review into the DB.
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
      const alreadyReviewed = await hasCustomerReviewedBusiness(req.body.customerid, req.body.businessid);
      if (alreadyReviewed) {
        res.status(403).send({
          error: "Customer has already posted a review of this business"
        });
      } else {
        const id = await insertNewReview(req.body);
        res.status(201).send({
          id: id,
          links: {
            review: `/reviews/${id}`,
            business: `/businesses/${req.body.businessid}`
          }
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting review into DB.  Please try again later."
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
      error: "Request body is not a valid review object."
    });
  }


});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const review = await getReviewById(parseInt(req.params.id));
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch review.  Please try again later."
    });
  }
});

/*
 * Route to update a review.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  if (validateAgainstSchema(req.body, ReviewSchema)) {
    try {
      /*
       * Make sure the updated review has the same businessID and userID as
       * the existing review.  If it doesn't, respond with a 403 error.  If the
       * review doesn't already exist, respond with a 404 error.
       */
      const id = parseInt(req.params.id);
      const existingReview = await getReviewById(id);
      if (existingReview) {
        try{
              //Try to validate user email
            const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
            if(!authorizedSearch){
              res.status(403).send({
                error: "Unauthorized to access the specific resource"
              })
            } else {


        if (req.body.businessid === existingReview.businessid && req.body.customerid === existingReview.customerid) {
          const updateSuccessful = await replaceReviewById(id, req.body);
          if (updateSuccessful) {
            res.status(200).send({
              links: {
                business: `/businesses/${req.body.businessid}`,
                review: `/reviews/${id}`
              }
            });
          } else {
            next();
          }
        } else {
          res.status(403).send({
            error: "Updated review must have the same businessID and customerID"
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
        error: "Unable to update review.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid review object."
    });
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  try {
    /*
     * Make sure the updated review has the same businessID and userID as
     * the existing review.  If it doesn't, respond with a 403 error.  If the
     * review doesn't already exist, respond with a 404 error.
     */
    const id = parseInt(req.params.id);
    const existingReview = await getReviewById(id);
    if (existingReview) {
      try{
            //Try to validate user email
          const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
          if(!authorizedSearch){
            res.status(403).send({
              error: "Unauthorized to access the specific resource"
            })
          } else {

  try {
    const deleteSuccessful = await deleteReviewById(parseInt(req.params.id));
    if (deleteSuccessful) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete review.  Please try again later."
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
    error: "Unable to deletee review with this id.  Please try again later."
  });
}
});

module.exports = router;
