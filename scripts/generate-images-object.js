/**
 * Generates a JSON file containing an object with all images URLs based on .webp archives from images/
 */
import fs from "fs";
import path from "path";

const BASE_URL = "https://rodrigoliveir.github.io/gi-dataset";
const IMAGES_DIR = "images";
const OUTPUT_FILE = "./images/images.json";

function walkDir(dir, base = "") {
  const result = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      result[entry.name] = walkDir(fullPath, relativePath);
    } else if (entry.isFile() && entry.name.endsWith(".webp")) {
      const url = `${BASE_URL}/${IMAGES_DIR}/${relativePath.replace(/\\/g, "/")}`;
      const key = path.basename(entry.name, ".webp");
      result[key] = url;
    }
  }
  return result;
}

function main() {
  const images = walkDir(IMAGES_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(images, null, 2));
  console.log(`✅ ${OUTPUT_FILE} atualizado com URLs do GitHub Pages`);
}

main();
