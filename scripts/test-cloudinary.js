const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

console.log("Testing Cloudinary connection...");
console.log("Environment variables check:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Missing"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "Set" : "Missing"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "Set" : "Missing"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  try {
    console.log("Testing Cloudinary API connection...");
    const result = await cloudinary.api.resources({ max_results: 1 });
    console.log("✅ Cloudinary connection successful!");
    console.log("Resource count:", result.resources.length);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
    return false;
  }
}

testCloudinary().then((success) => {
  process.exit(success ? 0 : 1);
});
