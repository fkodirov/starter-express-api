const express = require("express");
const cors = require("cors");
const cookieParse = require("cookie-parser");
const router = require("./router/index");
const errorMiddleware = require("./middleware/errorMiddleware");
const PORT = 5000;

const app = express();
app.use(express.json());
app.use(cookieParse());
const allowedOrigins = process.env.REACT_APP_ALLOWED_ORIGINS.split(",");
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);
app.use("/api", router);
app.use(errorMiddleware);

const start = () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
