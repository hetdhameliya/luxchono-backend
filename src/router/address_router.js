const { Router } = require("express");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");
const { addAddress, getAddress, deleteAddress, updateAddress, getOneAddress } = require("../controller/address_controller");

const router = Router();

router.post("/", verifyUser(USER_ROLE), addAddress);
router.get("/", verifyUser(USER_ROLE), getAddress);
router.get("/:id", verifyUser(USER_ROLE), getOneAddress);
router.put("/:id", verifyUser(USER_ROLE), updateAddress);
router.delete("/:id", verifyUser(USER_ROLE), deleteAddress);

module.exports = router;