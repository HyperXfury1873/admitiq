/** Issue a token with Node; Python will verify it (see verify_py.py). */
const fs = require("fs");
const path = require("path");
const { issue } = require("../../js/src");

const SECRET = "shared-cross-lang-secret";
const token = issue({ ticket_id: "cross-js", from: "javascript" }, 3600, SECRET);
fs.writeFileSync(path.join(__dirname, "token_from_js.txt"), token, "utf8");
console.log("Wrote token_from_js.txt");
console.log(token.slice(0, 40) + "...");
