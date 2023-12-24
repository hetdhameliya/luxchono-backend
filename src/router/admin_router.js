const { Router } = require("express");
const brandRouter = require("./admin/brand_router");
const {
  register,
  verifyAdminEmail,
  login,
} = require("../controller/admin/auth_controller");

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyAdminEmail);
router.post("/login", login);
router.use("/brand",brandRouter);


module.exports = router;
