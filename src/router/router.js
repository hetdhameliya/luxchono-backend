const { Router } = require("express");
const authRouter = require("./auth_router");
const productRouter = require("./product_router");
const likeRouter = require("./like_router");
const cartRouter = require("./cart_router");
const orderRouter = require("./order_router");
const addressRouter = require("./address_router");
const ratingRouter = require("./rating_router");

const router = Router();

router.use(authRouter);
router.use("/product", productRouter);
router.use("/wishlist", likeRouter);
router.use("/cart", cartRouter);
router.use("/order", orderRouter);
router.use("/address", addressRouter);
router.use("/rating", ratingRouter);

module.exports = router;
