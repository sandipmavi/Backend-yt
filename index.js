const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db.config.js");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/user.routes.js");
const videoRoutes = require("./routes/video.routes.js");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const port = process.env.PORT || 5000;
connectDb();

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/video", videoRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
