const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

const authRouter = require("./routes/authRoutes");
const categoryRouter = require("./routes/dashboard/categoryRoutes");
const productRouter = require("./routes/dashboard/productRoutes");
const sellerRouter = require("./routes/dashboard/sellerRoutes");
const { dbConnect } = require("./utils/db");

app.use("/api", authRouter);
app.use("/api", categoryRouter);
app.use("/api", productRouter);
app.use("/api", sellerRouter);
app.get("/", function (req, res) {
  res.send("Hi There!");
});
  

const port = process.env.PORT;
dbConnect();
app.listen(port, () => console.log(`Server is running on port ${port}`));
