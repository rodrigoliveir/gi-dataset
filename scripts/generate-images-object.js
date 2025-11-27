/**
 * Generates a JSON file containing an object with all images URLs based on
 * `.webp` files under the `images/` directory.
 *
 * The script walks the `images/` directory tree, creates a nested object
 * structure mirroring the folder layout and maps each `.webp` filename (key)
 * to a full URL using the configured `BASE_URL`. The result is written to
 * `images/images.json` and used by other scripts (for example,
 * `spread-images-urls.js`).
 *
 * Usage:
 *   node scripts/generate-images-object.js
 */
import fs from "fs";
import path from "path";

const BASE_URL = "https://rodrigoliveir.github.io/gi-dataset";
const IMAGES_DIR = "images";
const OUTPUT_FILE = "./images/images.json";

/**
 * Walk a directory tree and produce a nested object representing `.webp`
 * images.
 *
 * Each subdirectory becomes a nested object. Each `.webp` file becomes a
 * property whose key is the filename without extension and whose value is the
 * full URL built from `BASE_URL` and the file's relative path.
 *
 * @param {string} dir - Absolute or relative directory path to walk.
 * @param {string} [base=""] - Accumulated relative path used to build URLs.
 * @returns {Object} Nested object mapping image keys to URLs (or nested objects
 *                   for directories).
 */
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

/**
 * Entry point: build the images object and write it to `OUTPUT_FILE`.
 */
function main() {
  const images = walkDir(IMAGES_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(images, null, 2));
  console.log(`Images object up to date with ${BASE_URL} \x1b[32m✔\x1b[0m`);
}

main();
