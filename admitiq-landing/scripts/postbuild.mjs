import { copyFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";

const dist = join(process.cwd(), "dist");
const indexHtml = join(dist, "index.html");

copyFileSync(indexHtml, join(dist, "404.html"));

/** Physical copies so Hostinger/Apache serve routes without rewrite support. */
const SPA_ROUTES = [
  "why",
  "about",
  "privacy",
  "tutorial",
  "debugger",
  "use-cases",
  "getting-started",
  "python",
  "javascript",
  "security",
  "for-agents",
  "compare",
  "faq",
  "guides/secure-qr-codes",
  "guides/single-use-qr",
  "guides/expiring-tickets",
];

for (const route of SPA_ROUTES) {
  const outDir = join(dist, route);
  mkdirSync(outDir, { recursive: true });
  copyFileSync(indexHtml, join(outDir, "index.html"));
}

writeFileSync(
  join(dist, "web.config"),
  `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
`
);

if (!existsSync(join(dist, ".htaccess"))) {
  console.warn("postbuild: missing .htaccess in dist (expected from public/)");
}

console.log(
  `postbuild: wrote 404.html, web.config, and ${SPA_ROUTES.length} SPA route index.html files`
);
