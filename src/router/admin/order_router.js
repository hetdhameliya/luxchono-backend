const { Router } = require("express");
const { getAllOrder } = require("../../controller/admin/order_controller");
const { verifyAdmin } = require("../../middleware/verify_user");

const router = Router();

router.get("/", verifyAdmin, getAllOrder);

module.exports = router;