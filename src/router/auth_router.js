const { Router } = require("express");
const { register } = require("../controller/auth_controller");

const router = Router();

router.post("/register",register);

module.exports = router;