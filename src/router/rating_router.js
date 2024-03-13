const { Router } = require("express");
const { verifyUser } = require("../middleware/verify_user");
const { addRating } = require("../controller/rating_controller");

const router = Router();

router.post("/", verifyUser, addRating);

module.exports = router;
