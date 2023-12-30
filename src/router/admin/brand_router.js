const { Router } = require("express");
const { verifyUser } = require("../../middleware/verify_user");
const { ADMIN_ROLE, USER_ROLE } = require("../../config/string");
const { add, get, update, deleteBrand } = require("../../controller/admin/brand_controller");
const multer = require("../../middleware/multer");

const router = Router();
router.post("/", verifyUser(ADMIN_ROLE),
    multer.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 }]),
    add
);
router.get("/", verifyUser([ADMIN_ROLE, USER_ROLE]), get);
router.put("/:id", verifyUser(ADMIN_ROLE),
    multer.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 }]),
    update
);

router.delete("/", verifyUser(ADMIN_ROLE), deleteBrand);

module.exports = router;
