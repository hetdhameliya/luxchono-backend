const { Router } = require("express");
const { makeOrder, paymentOrder, paymentVerification, getOrder, getAllOrder } = require("../controller/order_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE, ADMIN_ROLE } = require("../config/string");

const router = Router();
router.post("/make-order", verifyUser(USER_ROLE), makeOrder);
router.post("/payment-order", verifyUser(USER_ROLE), paymentOrder);
router.get("/get-order", verifyUser(USER_ROLE), getOrder);
router.get("/get-all-order", verifyUser(ADMIN_ROLE), getAllOrder);
router.get("/get-user-order", verifyUser(USER_ROLE), getAllOrder);
router.post("/payment-verification", paymentVerification);

module.exports = router;