// Next.js 16 liefert eine native Flat-Config als Default-Export.
import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  { ignores: [".next/**", "node_modules/**"] },
];

export default eslintConfig;
