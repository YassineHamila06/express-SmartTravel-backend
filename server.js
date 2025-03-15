const express = require("express");
const errorHandller = require("./controllers/middleware/errorHandller");
const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv").config();

connectDB();
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/user", require("./routes/userRoutes"));
app.use(errorHandller);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
