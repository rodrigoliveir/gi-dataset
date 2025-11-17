import Ajv from "ajv";
import { formatAjvErrors } from "./helpers/format-ajv-errors.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

ajv.addFormat("percent", {
  type: "string",
  validate: (value) => /^[0-9]+(\.[0-9]+)?%$/.test(value)
});

const schema = JSON.parse(readFileSync("schemas/weapon.schema.json", "utf8"));
const validate = ajv.compile(schema);

const enDir = "data/en/weapons";
const enFiles = readdirSync(enDir).filter((f) => f.endsWith(".json"));
const ptDir = "data/pt/weapons";
const ptFiles = readdirSync(ptDir).filter((f) => f.endsWith(".json"));

for (const file of enFiles) {
  const data = JSON.parse(readFileSync(path.join(enDir, file), "utf8"));
  const valid = validate(data);

  if (valid) {
    console.log(`en/${file} \x1b[32m✔\x1b[0m`);
  } else {
    console.log(`en/${file} \x1b[31m✖\x1b[0m`);
    console.error(formatAjvErrors(validate.errors));
  }
}

for (const file of ptFiles) {
  const data = JSON.parse(readFileSync(path.join(ptDir, file), "utf8"));
  const valid = validate(data);

  if (valid) {
    console.log(`pt/${file} \x1b[32m✔\x1b[0m`);
  } else {
    console.log(`pt/${file} \x1b[31m✖\x1b[0m`);
    console.error(formatAjvErrors(validate.errors));
  }
}
