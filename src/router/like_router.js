const { Router } = require("express");
const { addRemoveLike, getAllLikeProduct, getAllLikeIds } = require("../controller/like_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");

const router = Router();

router.post("/add-remove-wishlist", verifyUser(USER_ROLE), addRemoveLike);
router.get("/", verifyUser(USER_ROLE), getAllLikeProduct);
router.get("/wishlist-id", verifyUser(USER_ROLE), getAllLikeIds);

module.exports = router;
