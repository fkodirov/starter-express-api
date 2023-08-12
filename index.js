const express = require("express");
const cors = require("cors");
const cookieParse = require("cookie-parser");
const router = require("./router/index");
const errorMiddleware = require("./middleware/errorMiddleware");
const PORT = 5000;

const app = express();
app.use(express.json());
app.use(cookieParse());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use("/api", router);
app.use(errorMiddleware);

const start = () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
