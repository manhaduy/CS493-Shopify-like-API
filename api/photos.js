/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  replacePhotoById,
  deletePhotoById
} = require('../models/photo');

const {requireAuthentication} = require('../lib/auth');
const {validateCustomerIdEmail} = require('../models/customer');
/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, async (req, res) => {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    //Try to validate
    try {
      const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
      if(!authorizedSearch){
        res.status(403).send({
          error: "Unauthorized to access the specific resource"
        })
      } else {

    try {
      const id = await insertNewPhoto(req.body);
      res.status(201).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          business: `/businesses/${req.body.businessid}`
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
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
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(parseInt(req.params.id));
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:id', requireAuthentication, async (req, res, next) => {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    try {
      /*
       * Make sure the updated photo has the same businessID and userID as
       * the existing photo.  If it doesn't, respond with a 403 error.  If the
       * photo doesn't already exist, respond with a 404 error.
       */
       const id = parseInt(req.params.id);
       const existingPhoto = await getPhotoById(id);
       //validate photo by id
         if (existingPhoto) {
           try{
                 //Try to validate user email
               const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
               if(!authorizedSearch){
                 res.status(403).send({
                   error: "Unauthorized to access the specific resource"
                 })
               } else {


        if (req.body.businessid === existingPhoto.businessid && req.body.customerid === existingPhoto.customerid) {
          const updateSuccessful = await replacePhotoById(id, req.body);
          if (updateSuccessful) {
            res.status(200).send({
              links: {
                business: `/businesses/${req.body.businessid}`,
                photo: `/photos/${id}`
              }
            });
          } else {
            next();
          }
        } else {
          res.status(403).send({
            error: "Updated photo must have the same businessID and customerID"
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
  error: "Unable to update photo.  Please try again later."
});
}


  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object."
    });
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  try{
    const id = parseInt(req.params.id);
    const existingPhoto = await getPhotoById(id);
    //validate photo by id
      if (existingPhoto) {
        try{
              //Try to validate user email
            const authorizedSearch = await validateCustomerIdEmail(req.customer, parseInt(req.params.id) );
            if(!authorizedSearch){
              res.status(403).send({
                error: "Unauthorized to access the specific resource"
              })
            } else {

  try {
    const deleteSuccessful = await deletePhotoById(parseInt(req.params.id));
    if (deleteSuccessful) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to delete photo.  Please try again later."
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
  error: "Unable to delete photo with this id.  Please try again later."
});
}


});

module.exports = router;
