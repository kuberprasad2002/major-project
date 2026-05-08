const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router
.route("/")
.get(wrapAsync(listingController.index))
.post(
          isLoggedIn ,
          upload.single("listing[image]"),
          validateListing,
          wrapAsync(listingController.createListing)
);

// New Route
router.get("/new", isLoggedIn ,listingController.renderNewForm);

// SEARCH ROUTE
router.get("/search", async (req, res) => {

    const { q } = req.query;

    if (!q) {
        req.flash("error", "Search field is empty!");
        return res.redirect("/listings");
    }

    const searchedListing = await Listing.find({
        $or: [
            { country: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } }
        ]
    });

    // res.render("listings/index.ejs", {
    //     allListings: searchedListing
    // });

       res.json(searchedListing);



});


router.get("/filter/:category", async (req, res) => {

    let { category } = req.params;

    const filteredListings = await Listing.find({ category });

    res.json(filteredListings);

});

// SHOW ROUTE UPDATE ROUTE DELETE ROUTE
router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
)
.delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
);




// router
// .route("/:id")
// .get(wrapAsync(listingController.showListing))
// .put(isLoggedIn,
//           isOwner ,
//           upload.single("listing[image]"),
//           validateListing,
//           wrapAsync(listingController.updateListing)
// )
// .delete(isLoggedIn,
//           isOwner,
//           wrapAsync(listingController.destroyListing)
// );

//Edit Route
router.get("/:id/edit", isLoggedIn,isOwner ,wrapAsync(listingController.renderEditForm));

module.exports = router;