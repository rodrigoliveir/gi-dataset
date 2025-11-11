import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = JSON.parse(readFileSync("schemas/character.schema.json", "utf8"));
const validate = ajv.compile(schema);

const dir = "data/characters";
const files = readdirSync(dir).filter(f => f.endsWith(".json"));

for (const file of files) {
  const data = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
  const valid = validate(data);

  if (valid) {
    console.log(`✅ ${file} is valid`);
  } else {
    console.log(`❌ ${file} is invalid`);
    console.log(ajv.errorsText(validate.errors, { separator: "\n" }));
  }
}