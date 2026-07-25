/** Verify the token written by issue_py.py */
const fs = require("fs");
const path = require("path");
const { verify } = require("../../js/src");

const SECRET = "shared-cross-lang-secret";
const token = fs.readFileSync(path.join(__dirname, "token_from_python.txt"), "utf8").trim();

verify(token, SECRET).then((payload) => {
  console.log("Node verified Python token:", payload.data);
}).catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
