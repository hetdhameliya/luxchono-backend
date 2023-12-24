const { Router } = require("express");
const { register, verifyEmail, verifyOtp, login } = require("../controller/auth_controller");

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOtp)
router.post("/login", login);

module.exports = router;