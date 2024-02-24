const { Router } = require("express");
const { addRemoveLike, getAllLikeProduct, getAllLikeIds } = require("../controller/like_controller");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");

const router = Router();

router.post("/add-remove-wishlist", verifyUser, addRemoveLike);
router.get("/", verifyUser, getAllLikeProduct);
router.get("/wishlist-id", verifyUser, getAllLikeIds);

module.exports = router;
