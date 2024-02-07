const { Router } = require("express");
const { addCart, getAllCartProduct, updateCartProduct, removeCart, getAllCartIds } = require("../controller/cart_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");

const router = Router();

router.post("/add-cart", verifyUser(USER_ROLE), addCart);
router.get("/", verifyUser(USER_ROLE), getAllCartProduct);
router.patch("/:pid", verifyUser(USER_ROLE), updateCartProduct);
router.delete("/:pid", verifyUser(USER_ROLE), removeCart);
router.get("/cart-id", verifyUser(USER_ROLE), getAllCartIds);

module.exports = router;
