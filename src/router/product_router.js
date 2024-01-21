const { Router } = require("express");
const { getProducts } = require("../controller/product_controller");

const router = Router();

router.get("/", getProducts);

module.exports = router;