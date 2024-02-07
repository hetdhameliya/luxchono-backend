const { Router } = require("express");
const { makeOrder } = require("../controller/order_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");

const router = Router();
router.post("/make-order", verifyUser(USER_ROLE), makeOrder);

module.exports = router;