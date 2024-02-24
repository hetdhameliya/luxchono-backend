const { Router } = require("express");
const { verifyUser } = require("../middleware/verify_user");
const { USER_ROLE } = require("../config/string");
const { addAddress, getAddress, deleteAddress, updateAddress, getOneAddress } = require("../controller/address_controller");

const router = Router();

router.post("/", verifyUser, addAddress);
router.get("/", verifyUser, getAddress);
router.get("/:id", verifyUser, getOneAddress);
router.put("/:id", verifyUser, updateAddress);
router.delete("/:id", verifyUser, deleteAddress);

module.exports = router;