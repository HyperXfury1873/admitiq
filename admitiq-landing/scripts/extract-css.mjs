import fs from "fs";

const s = fs.readFileSync("src/AdmitiQLanding.jsx", "utf8");
const start = s.indexOf("<style>{`");
const end = s.indexOf("`}</style>");
if (start < 0 || end < 0) {
  console.error("style block not found");
  process.exit(1);
}
const css = s.slice(start + "<style>{`".length, end);
fs.mkdirSync("src/styles", { recursive: true });
fs.writeFileSync("src/styles/site.css", css.trimStart());
console.log("wrote site.css", css.length, "chars");
