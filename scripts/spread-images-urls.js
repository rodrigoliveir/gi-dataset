/**
 * Spreads all updated URLs from images.json to JSON archives in data/
 */
import fs from "fs";
import path from "path";

const DATA_DIR = "data";
const IMAGES_FILE = "./images/images.json";

const images = JSON.parse(fs.readFileSync(IMAGES_FILE, "utf8"));

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
              // console.log(`🔁 Substituído por palavra-chave "${keyword}"`);
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

function updateJsonFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let updated = false;

  if (replaceUrlsByKeywords(content)) {
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");
    console.log(`✅ Atualizado: ${filePath}`);
  }
}

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
  console.log("\n🚀 Todas as URLs foram propagadas com sucesso!");
}

main();
