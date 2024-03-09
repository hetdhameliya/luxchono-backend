const { Router } = require("express");
const { verifyAdmin } = require("../../middleware/verify_user");
const { addOffer, updateOffer, getAllOffer, deleteOffer } = require("../../controller/admin/offer_controller");
const upload = require("../../middleware/multer");

const router = Router();

router.post("/", verifyAdmin, upload.single("image"), addOffer);
router.get("/", verifyAdmin, getAllOffer);
router.put("/:id", verifyAdmin, upload.single("image"), updateOffer);
router.delete("/", verifyAdmin, deleteOffer);

module.exports = router;