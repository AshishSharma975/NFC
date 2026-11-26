import fs from "fs";
import path from "path";
import { generateCardSvgString } from "../src/utils/cardDesignSvgs.js";

const artifactDir = "C:/Users/asus/.gemini/antigravity/brain/36d92955-c8e7-4667-81f2-148428f3fad6";

// 1. Exact 6x6 Stand with QR (Tapform Design 2 Paw)
const standWithQr = generateCardSvgString({
  format: "table-stand",
  theme: "paw-white",
  cardType: "connect",
  title: "Tapform",
  cardId: "SSHOP-1133",
  cardNumber: "1133",
  isBlank: false,
});

// 2. Exact 6x6 Blank Stand (Blank QR placeholder for physical printing)
const standBlank = generateCardSvgString({
  format: "table-stand",
  theme: "paw-white",
  cardType: "connect",
  title: "Tapform",
  cardId: "BLANK-STAND",
  cardNumber: "1133",
  isBlank: true,
});

// 3. 85x54mm Pocket Card All-in-One Front
const card85x54Front = generateCardSvgString({
  format: "nfc-card",
  theme: "paw-white",
  cardType: "connect",
  side: "front",
  title: "Tapform",
  cardId: "TF-1133",
  cardNumber: "1133",
});

// 4. 85x54mm Pocket Card Back (Brand + 9893711447 + Gmail)
const card85x54Back = generateCardSvgString({
  format: "nfc-card",
  theme: "matte-black",
  side: "back",
  title: "Tapform",
  cardId: "TF-1133",
  cardNumber: "1133",
  brandName: "Tapform",
  phone: "9893711447",
  email: "ajjumahato9@gmail.com",
});

fs.writeFileSync(path.join(artifactDir, "stand_6x6_with_qr.svg"), standWithQr);
fs.writeFileSync(path.join(artifactDir, "stand_6x6_blank.svg"), standBlank);
fs.writeFileSync(path.join(artifactDir, "card_85x54_all_in_one_front.svg"), card85x54Front);
fs.writeFileSync(path.join(artifactDir, "card_85x54_back.svg"), card85x54Back);

console.log("All requested 6x6 & 85x54 SVGs generated successfully!");
