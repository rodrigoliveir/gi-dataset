/**
 * Converts all .png files located at images/ to .webp files.
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
 * Finds recursively all .png files from a directory.
 * @param {string} dir
 * @returns {string[]} caminhos absolutos
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

const convertAllPngToWebp = async () => {
  if (!fs.existsSync(baseDir)) {
    console.error(`Diretório base não encontrado: ${baseDir}`);
    process.exit(1);
  }

  const pngFiles = findPngFiles(baseDir);
  console.log(`🔍 Encontrados ${pngFiles.length} arquivos .png em ${baseDir}`);

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
        console.log(`✅ Convertido: ${path.relative(baseDir, webpPath)}`);
        fs.unlinkSync(pngPath);
        console.log(`🗑️  Removido original: ${path.relative(baseDir, pngPath)}`);
      } else {
        console.warn(
          `⚠️ Conversão não gerou arquivo webp para: ${path.relative(baseDir, pngPath)}`
        );
      }
    } catch (err) {
      console.error(`❌ Erro ao converter ${path.relative(baseDir, pngPath)}: ${err.message}`);
    }
  }
};

convertAllPngToWebp().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
