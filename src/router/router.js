const { Router } = require("express");
const authRouter = require("./auth_router");
const productRouter = require("./product_router");

const router = Router();

router.use(authRouter);
router.use("/product", productRouter);

module.exports = router;
