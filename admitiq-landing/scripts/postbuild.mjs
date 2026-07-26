import { copyFileSync, writeFileSync } from "fs";
import { join } from "path";

const dist = join(process.cwd(), "dist");
copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
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
console.log("postbuild: wrote 404.html + web.config");
