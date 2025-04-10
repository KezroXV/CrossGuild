const fs = require("fs");
const path = require("path");

// Créer les dossiers nécessaires
const offersDir = path.join(process.cwd(), "public", "offers");

if (!fs.existsSync(offersDir)) {
  console.log("Création du dossier offers...");
  fs.mkdirSync(offersDir, { recursive: true });
}

// Vérification des images par défaut
const defaultImage1Path = path.join(offersDir, "offer1.png");
const defaultImage2Path = path.join(offersDir, "offer2.png");

if (!fs.existsSync(defaultImage1Path)) {
  console.log("Image offer1.png manquante.");
  // Vous pourriez créer une image simple ici ou copier depuis ailleurs
}

if (!fs.existsSync(defaultImage2Path)) {
  console.log("Image offer2.png manquante.");
}

console.log("Vérification des images terminée.");
