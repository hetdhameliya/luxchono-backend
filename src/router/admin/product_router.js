const { Router } = require("express");
const { verifyUser } = require("../../middleware/verify_user");
const multer = require("../../middleware/multer");
const { addProduct, deleteProduct, getProduct, updateProduct } = require("../../controller/admin/product_controller");
const { ADMIN_ROLE } = require("../../config/string");

const router = Router();
router.post("/", verifyUser(ADMIN_ROLE), multer.fields([
    { name: "image", maxCount: 4 },
    { name: "thumbnail", maxCount: 1 }]),
    addProduct
);

router.get("/", getProduct);
router.put("/:id", verifyUser(ADMIN_ROLE), multer.fields([
    { name: "image", maxCount: 4 },
    { name: "thumbnail", maxCount: 1 }]),
    updateProduct
);
router.delete("/", verifyUser(ADMIN_ROLE), deleteProduct);

module.exports = router;