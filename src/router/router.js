const { Router } = require("express");
const authRouter = require("./auth_router");

const router = Router();

router.use(authRouter);

module.exports = router;
