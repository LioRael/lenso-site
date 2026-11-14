import { writeFile } from "node:fs/promises";
import config from "./docs.config";

const redirects = ["/en / 301"];
for (const group of config.navigation ?? []) {
  for (const page of group.pages) {
    if (page === "index") continue;
    const route = page.endsWith("/index") ? page.slice(0, -6) : page;
    redirects.push(`/en/${route}/ /${route}/ 301`);
  }
}
redirects.push("/en/* /:splat 301");
await writeFile("out/_redirects", `${redirects.join("\n")}\n`);
