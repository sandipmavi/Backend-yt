const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db.config.js");
const dotenv = require("dotenv");

const userRoutes = require("./routes/user.routes.js");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const port = process.env.PORT || 5000;
connectDb();

app.use("/api/v1/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
