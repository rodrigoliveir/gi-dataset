/**
 * Spreads all updated URLs from `images/images.json` to JSON archives in `data/`.
 *
 * Reads the canonical image URLs object produced by `generate-images-object.js`,
 * flattens nested structures into a simple `keyword -> url` map and then walks
 * the `data/` directory replacing found image URLs with the canonical ones.
 * Updated .json files are written in-place and each successful update is logged
 * to stdout.
 *
 * Usage:
 *   node scripts/spread-images-urls.js
 */
import fs from "fs";
import path from "path";

const DATA_DIR = "data";
const IMAGES_FILE = "./images/images.json";

const images = JSON.parse(fs.readFileSync(IMAGES_FILE, "utf8"));

/**
 * Flatten a nested images object into a simple map of `key -> url`.
 *
 * The input is expected to be the nested structure produced by
 * `generate-images-object.js` (directories as nested objects, file keys as
 * properties). This function collects all string values that look like URLs
 * (start with `http`) and returns an object whose keys are the original
 * property names and values are the corresponding URLs.
 *
 * @param {Object} obj - Nested images object read from `images/images.json`.
 * @returns {Object} A flat map where keys are image keys (filenames) and
 *                   values are absolute URLs.
 */
function flattenImageData(obj) {
  const flat = {};

  function traverse(subObj) {
    for (const key in subObj) {
      const value = subObj[key];
      if (typeof value === "object" && value !== null) {
        traverse(value);
      } else if (typeof value === "string" && value.startsWith("http")) {
        flat[key] = value;
      }
    }
  }

  traverse(obj);
  return flat;
}

const flatImages = flattenImageData(images);

/**
 * Traverse a parsed JSON object and replace any URL string that contains a
 * known image keyword with the canonical URL from `flatImages`.
 *
 * This function mutates the provided object in-place. It returns `true` when
 * at least one replacement was performed, otherwise `false`.
 *
 * @param {Object} obj - Parsed JSON content from a data file to process.
 * @returns {boolean} `true` if the object was modified; `false` otherwise.
 */
function replaceUrlsByKeywords(obj) {
  let updated = false;

  function traverse(node) {
    if (typeof node === "object" && node !== null) {
      for (const key in node) {
        const value = node[key];

        if (typeof value === "string" && value.startsWith("http")) {
          for (const keyword in flatImages) {
            if (value.includes(keyword)) {
              node[key] = flatImages[keyword];
              updated = true;
              break;
            }
          }
        } else if (typeof value === "object" && value !== null) {
          traverse(value);
        }
      }
    }
  }

  traverse(obj);
  return updated;
}

/**
 * Read a JSON file, attempt to replace image URLs and write the file back if
 * modifications occurred.
 *
 * @param {string} filePath - Path to the JSON file to update.
 */
function updateJsonFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let updated = false;

  if (replaceUrlsByKeywords(content)) {
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");
    console.log(`  • ${filePath} \x1b[32m✔\x1b[0m`);
  }
}

/**
 * Recursively walk the provided directory and process every `.json` file
 * encountered using `updateJsonFile`.
 *
 * @param {string} dir - Path to the directory to traverse (e.g. `data`).
 */
function walkDataDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDataDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      updateJsonFile(fullPath);
    }
  }
}

function main() {
  walkDataDir(DATA_DIR);
  console.log("\n\x1b[32mAll URLs successfully spreaded!\x1b[0m");
}

main();
