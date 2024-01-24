const { Router } = require("express");
const { addRemoveCart, getAllCartProduct, updateCartProduct } = require("../controller/cart_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");

const router = Router();

router.post("/add-remove-cart", verifyUser(USER_ROLE), addRemoveCart);
router.get("/", verifyUser(USER_ROLE), getAllCartProduct);
router.patch("/:pid", verifyUser(USER_ROLE), updateCartProduct);

module.exports = router;
