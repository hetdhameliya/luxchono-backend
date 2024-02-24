const { Router } = require("express");
const { verifyAdmin } = require("../../middleware/verify_user");
const { ADMIN_ROLE, SUPER_ADMIN_ROLE } = require("../../config/string");
const { add, get, update, deleteCategory } = require("../../controller/admin/category_controller");
const multer = require("../../middleware/multer");

const router = Router();
router.post("/", verifyAdmin,
    multer.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 }]),
    add
);
router.get("/", get);
router.put("/:id", verifyAdmin,
    multer.fields([
        { name: "icon", maxCount: 1 },
        { name: "image", maxCount: 1 }]),
    update
);

router.delete("/", verifyAdmin, deleteCategory);

module.exports = router;
