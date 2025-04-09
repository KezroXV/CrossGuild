const { execSync } = require("child_process");
const path = require("path");

console.log("Updating database schema to add button URLs...");

try {
  // Generate a migration that adds the new fields
  execSync("npx prisma migrate dev --name add_button_urls", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, "../"),
  });

  console.log("Schema updated successfully!");
} catch (error) {
  console.error("Error updating schema:", error.message);

  // Fallback to db push if migration fails
  try {
    console.log("Trying with db push instead...");
    execSync("npx prisma db push", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, "../"),
    });
    console.log("Schema pushed successfully!");
  } catch (pushError) {
    console.error("Error pushing schema:", pushError.message);
    process.exit(1);
  }
}
