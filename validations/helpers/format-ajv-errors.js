export function formatAjvErrors(errors) {
  if (!errors || errors.length === 0) return "";

  return errors
    .map((err) => {
      const prop = err.instancePath || err.params.missingProperty;
      const cleanProp = prop?.replace(/^\//, "") || "(root)";

      return `  • ${err.message.replace("must have required property", "missing property")} (${cleanProp})`;
    })
    .join("\n");
}
