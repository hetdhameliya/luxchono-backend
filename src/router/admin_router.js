const { Router } = require("express");
const brandRouter = require("./admin/brand_router");
const categoryRouter = require("./admin/category_router");
const productRouter = require("./admin/product_router");
const orderRouter = require("./admin/order_router");
const offerRouter = require("./admin/offer_router");
const {
  register,
  verifyAdminEmail,
  login,
  adminVerified,
  getAllAdmin,
  getAllUser,
} = require("../controller/admin/auth_controller");
const { verifySuperAdmin, verifyAdmin } = require("../middleware/verify_user");
const { dashboard, brandRevenue, getProductReview, orderCount } = require("../controller/admin/dashboard_controller");

const router = Router();

router.post("/register", register);
router.get("/verify-email", verifyAdminEmail);
router.post("/login", login);
router.patch("/admin-verified/:id", verifySuperAdmin, adminVerified);
router.get("/get-all-admin", verifySuperAdmin, getAllAdmin);
router.get("/get-all-user", verifyAdmin, getAllUser);
router.get("/dashboard", verifyAdmin, dashboard);
router.get("/brand-revenue", verifyAdmin, brandRevenue);
router.get("/get-rating", verifyAdmin, getProductReview);
router.get("/order-count", verifyAdmin, orderCount);
router.use("/brand", brandRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);
router.use("/offer", offerRouter);


module.exports = router;
