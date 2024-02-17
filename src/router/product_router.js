const { Router } = require("express");
const { getProducts, getOneProduct } = require("../controller/product_controller");

const router = Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);

module.exports = router;