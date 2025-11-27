/**
 * Convert PNG images under `images/` to WebP format.
 *
 * This script recursively finds `.png` files in the `images/` directory,
 * converts each to `.webp` using `imagemin` + `imagemin-webp` and removes the
 * original `.png` on successful conversion. It logs progress and warnings to
 * stdout/stderr and exits with a non-zero code if the base images directory is
 * missing or an uncaught error happens.
 *
 * Usage:
 *   node scripts/convert-png-to-webp.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, ".././images");
const quality = 100;

/**
 * Recursively find all `.png` files in `dir`.
 *
 * @param {string} dir - Directory to search.
 * @returns {string[]} Array of absolute file paths to `.png` files.
 */
const findPngFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const name of list) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(findPngFiles(full));
    } else if (stat.isFile() && name.toLowerCase().endsWith(".png")) {
      results.push(full);
    }
  }
  return results;
};

/**
 * Convert every `.png` found under `baseDir` to `.webp` and delete the
 * original `.png` when conversion succeeds.
 *
 * Behaviour:
 *  - Validates `baseDir` exists.
 *  - Finds all `.png` files using `findPngFiles`.
 *  - Converts each file with `imagemin-webp` using the configured `quality`.
 *  - If the `.webp` is generated, logs success and removes the original PNG.
 *  - On conversion failure logs an error and continues with remaining files.
 *
 * @returns {Promise<void>} Resolves when processing is complete.
 */
const convertAllPngToWebp = async () => {
  if (!fs.existsSync(baseDir)) {
    console.error(`\x1b[31mBase directory not found: ${baseDir}\x1b[0m`);
    process.exit(1);
  }

  const pngFiles = findPngFiles(baseDir);
  console.warn(`\x1b[33mWARN\x1b[0m\n  ${pngFiles.length} files .png finded in ${baseDir}`);

  for (const pngPath of pngFiles) {
    const dir = path.dirname(pngPath);
    const name = path.basename(pngPath, ".png");
    const webpPath = path.join(dir, `${name}.webp`);

    try {
      const results = await imagemin([pngPath], {
        destination: dir,
        plugins: [imageminWebp({ quality })]
      });

      if (results && results.length > 0 && fs.existsSync(webpPath)) {
        console.log(`\x1b[32m✔\x1b[0m Converted: ${path.relative(baseDir, webpPath)}`);
        fs.unlinkSync(pngPath);
      } else {
        console.warn(
          `\x1b[33mWARN\x1b[0m\n  Conversion didn't generate webp file for: ${path.relative(baseDir, pngPath)}`
        );
      }
    } catch (err) {
      console.error(
        `\x1b[31m✖\x1b[0m Error on convert ${path.relative(baseDir, pngPath)}: \x1b[31m${err.message}\x1b[0m`
      );
    }
  }
};

convertAllPngToWebp().catch((err) => {
  console.error(`\x1b[31mFatal error: ${err}\x1b[0m`);
  process.exit(1);
});
