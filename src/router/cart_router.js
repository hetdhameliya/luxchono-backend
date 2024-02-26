const { Router } = require("express");
const { addCart, getAllCartProduct, updateCartProduct, removeCart, getAllCartIds } = require("../controller/cart_controller");
const { verifyUser } = require("../middleware/verify_user");

const router = Router();

router.post("/add-cart", verifyUser, addCart);
router.get("/", verifyUser, getAllCartProduct);
router.patch("/:pid", verifyUser, updateCartProduct);
router.delete("/:pid", verifyUser, removeCart);
router.get("/cart-id", verifyUser, getAllCartIds);

module.exports = router;
