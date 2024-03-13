const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { PORT } = require("./src/config/config");
const router = require("./src/router/router");
const adminRouter = require("./src/router/admin_router");
const errorMiddleware = require("./src/middleware/error");
const databaseConnect = require("./src/database/index");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
databaseConnect();

app.get("/", (_req, res) => {
  res.send("Server start");
});

app.use(router);
app.use("/admin", adminRouter);
app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`Server start port on ${PORT}`);
});
