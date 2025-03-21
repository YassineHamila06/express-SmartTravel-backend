const express = require("express");
const router = express.Router();
const upload = require("../controllers/middleware/uploadMiddleware");
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  activateTrip,
} = require("../controllers/tripController");

//const validateToken = require("../controllers/middleware/validateTokenhandller");


// Use Multer only for create (you can add for update too)
router.post("/", upload.single("image"), createTrip);
router.put("/:id", upload.single("image"), updateTrip);


router.get("/",getTrips);
router.get("/:id",getTrip);
router.delete("/:id",deleteTrip);

router.route("/:id/activate").patch(activateTrip); // Admin: Activate trip

module.exports = router;
