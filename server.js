const express = require("express");
const cors = require("cors");
const errorHandler = require("./controllers/middleware/errorHandller"); // Corrected the file name and variable name
const connectDB = require("./config/dbConnection");
const dotenv = require("dotenv").config();


connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/admin",require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/trip", require("./routes/tripRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});





