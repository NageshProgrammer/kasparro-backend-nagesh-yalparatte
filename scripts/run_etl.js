require("dotenv").config();
const { runEtlOnce } = require("./etl_core");
const { connectDB } = require("../src/config/db");

(async () => {
  try {
    await connectDB();
    await runEtlOnce();
    console.log("✅ ETL completed");
  } catch (err) {
    console.error("❌ ETL failed", err);
    process.exit(1);
  }
})();
