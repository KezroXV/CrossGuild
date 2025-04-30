/**
 * This script helps deploy the ContactInfo and SocialLinks models
 * Run this with: node scripts/deploy-db-models.js
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    throw error;
  }
}

async function deployModels() {
  try {
    console.log("Generating Prisma client...");
    await runCommand("npx prisma generate");

    console.log("Creating migration for ContactInfo and SocialLinks models...");
    await runCommand(
      "npx prisma migrate dev --name add_contact_info_and_social_links"
    );

    console.log("Deployment completed successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

deployModels();
