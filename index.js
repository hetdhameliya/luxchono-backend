const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { PORT } = require("./src/config/config");
const router = require("./src/router/router");
const adminRouter = require("./src/router/admin_router");
const errorMiddleware = require("./src/middleware/error");
const databaseConnect = require("./src/database/index");
const upload = require("./src/middleware/multer");
const ApiError = require("./src/util/error");
const { cloudinary } = require("./src/util/cloudinary");
const fs = require("fs");


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
databaseConnect();

app.get("/", (_req, res) => {
  res.send("Server start");
});

app.use(router);
app.use("/admin", adminRouter);
app.post("/file-upload", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, { use_filename: true });
      fs.unlinkSync(file.path);
      return res.status(200).json({ statusCode: 200, success: true, data: result });
    }
    return next(new ApiError(400, "Please insert file"));
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
});
app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`Server start port on ${PORT}`);
});
