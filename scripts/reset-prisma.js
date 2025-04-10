const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Resetting Prisma...");

// Paths to clean
const paths = [
  path.join(process.cwd(), "node_modules", ".prisma"),
  path.join(process.cwd(), ".prisma"),
];

// Delete directories if they exist
for (const dir of paths) {
  try {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Error removing ${dir}:`, err);
  }
}

// Regenerate Prisma client
try {
  console.log("Regenerating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("Done!");
} catch (err) {
  console.error("Failed to regenerate Prisma client:", err);
}
