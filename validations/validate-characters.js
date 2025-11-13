import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(readFileSync("schemas/character.schema.json", "utf8"));
const validate = ajv.compile(schema);

const enDir = "data/en/characters";
const ptDir = "data/pt/characters";
const enFiles = readdirSync(enDir).filter((f) => f.endsWith(".json"));
const ptFiles = readdirSync(ptDir).filter((f) => f.endsWith(".json"));

for (const file of enFiles) {
  const data = JSON.parse(readFileSync(path.join(enDir, file), "utf8"));
  const valid = validate(data);

  if (valid) {
    console.log(`✅ ${enDir}/${file} is valid`);
  } else {
    console.log(`❌ ${enDir}/${file} is invalid`);
    console.log(ajv.errorsText(validate.errors, { separator: "\n" }));
  }
}

for (const file of ptFiles) {
  const data = JSON.parse(readFileSync(path.join(ptDir, file), "utf8"));
  const valid = validate(data);

  if (valid) {
    console.log(`✅ ${ptDir}/${file} is valid`);
  } else {
    console.log(`❌ ${ptDir}/${file} is invalid`);
    console.log(ajv.errorsText(validate.errors, { separator: "\n" }));
  }
}
