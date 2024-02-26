const { Router } = require("express");
const brandRouter = require("./admin/brand_router");
const categoryRouter = require("./admin/category_router");
const productRouter = require("./admin/product_router");
const orderRouter = require("./admin/order_router");
const {
  register,
  verifyAdminEmail,
  login,
  adminVerified,
  getAllAdmin,
} = require("../controller/admin/auth_controller");
const { verifySuperAdmin } = require("../middleware/verify_user");

const router = Router();

router.post("/register", register);
router.get("/verify-email", verifyAdminEmail);
router.post("/login", login);
router.patch("/admin-verified/:id", verifySuperAdmin, adminVerified);
router.get("/get-all-admin", verifySuperAdmin, getAllAdmin);
router.use("/brand", brandRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);


module.exports = router;
