const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_CONNECT, {});
  } catch (error) {
    console.log("error", error);
    process.exit();
  }
};

module.exports = dbConnect;
