const { Router } = require("express");
const { getAllOrder, orderStatusChange } = require("../../controller/admin/order_controller");
const { verifyAdmin } = require("../../middleware/verify_user");

const router = Router();

router.get("/", verifyAdmin, getAllOrder);
router.patch("/status-change", verifyAdmin, orderStatusChange);

module.exports = router;