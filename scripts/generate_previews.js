import fs from "fs";
import path from "path";
import { generateCardSvgString } from "../src/utils/cardDesignSvgs.js";

const artifactDir = "C:/Users/asus/.gemini/antigravity/brain/36d92955-c8e7-4667-81f2-148428f3fad6";

const frontSvg = generateCardSvgString({
  format: "nfc-card",
  theme: "matte-black",
  side: "front",
  title: "Your Business Name",
  cardId: "TF-02",
  cardNumber: 2,
  brandName: "TAPFORM",
  phone: "8827718774",
  email: "ashish8389sharma@gmail.com",
});

const backSvg = generateCardSvgString({
  format: "nfc-card",
  theme: "matte-black",
  side: "back",
  title: "Your Business Name",
  cardId: "TF-02",
  cardNumber: 2,
  brandName: "TAPFORM",
  phone: "8827718774",
  email: "ashish8389sharma@gmail.com",
});

fs.writeFileSync(path.join(artifactDir, "card_front_preview.svg"), frontSvg);
fs.writeFileSync(path.join(artifactDir, "card_back_preview.svg"), backSvg);
console.log("SVGs exported successfully to artifact directory!");
