const { Router } = require("express");
const { makeOrder, paymentOrder, paymentVerification, getOrder, getAllOrder } = require("../controller/order_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE } = require("../config/string");

const router = Router();
router.post("/make-order", verifyUser, makeOrder);
router.post("/payment-order", verifyUser, paymentOrder);
router.get("/get-order", verifyUser, getOrder);
router.get("/get-user-order", verifyUser, getAllOrder);
router.post("/payment-verification", paymentVerification);

module.exports = router;