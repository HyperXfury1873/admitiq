import fs from "fs";

const s = fs.readFileSync("src/AdmitiQLanding.jsx", "utf8");

// Keep lines 1-731 (through InteractiveTutorial) as tutorial module, rewrite imports/exports
const head = `import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { demoIssue, demoVerify } from "../lib/demoCrypto.js";
import { TUTORIAL_CASES } from "../data/content.js";

`;

// Extract from makeQrDataUrl through InteractiveTutorial end
const makeQrStart = s.indexOf("async function makeQrDataUrl");
const tutorialEnd = s.indexOf("export default function AdmitiQLanding");
let body = s.slice(makeQrStart, tutorialEnd);

// Remove CopyButton dependency issues - keep CopyButton in body
// Replace demoIssue/demoVerify - they're used, need crypto in lib
// Remove TUTORIAL_CASES from body if present - it's before makeQr

body = body.replace(
  /export default function AdmitiQLanding[\s\S]*/,
  ""
);

const out = `${head}${body}
export { InteractiveTutorial, CopyButton, springHover, sectionReveal, HeroTicket };
`;

fs.mkdirSync("src/tutorial", { recursive: true });
fs.writeFileSync("src/tutorial/InteractiveTutorial.jsx", out);
console.log("wrote InteractiveTutorial.jsx", out.length);
