#!/usr/bin/env node

/**
 * Script de vérification avant déploiement
 * Vérifie que toutes les variables d'environnement nécessaires sont définies
 */

const requiredEnvVars = [
  "NEXTAUTH_URL",
  "AUTH_SECRET",
  "DATABASE_URL",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "GOOGLE_ID",
  "GOOGLE_SECRET",
];

const optionalEnvVars = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

console.log("🔍 Vérification des variables d'environnement...\n");

let hasErrors = false;

// Vérification des variables requises
console.log("📋 Variables requises:");
requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? "✅" : "❌";
  console.log(`  ${status} ${varName}: ${value ? "Définie" : "MANQUANTE"}`);
  if (!value) hasErrors = true;
});

console.log("\n📋 Variables optionnelles:");
optionalEnvVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? "✅" : "⚠️";
  console.log(`  ${status} ${varName}: ${value ? "Définie" : "Non définie"}`);
});

console.log("\n🌍 Configuration d'environnement:");
console.log(`  NODE_ENV: ${process.env.NODE_ENV || "non défini"}`);
console.log(`  NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || "non défini"}`);

if (hasErrors) {
  console.log(
    "\n❌ Erreur: Des variables d'environnement requises sont manquantes!"
  );
  console.log("💡 Vérifiez votre fichier .env.local ou vos variables Vercel.");
  process.exit(1);
} else {
  console.log("\n✅ Toutes les variables requises sont définies!");
  console.log("🚀 Prêt pour le déploiement.");
}
