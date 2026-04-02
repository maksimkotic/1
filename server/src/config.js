import fs from "node:fs";
import path from "node:path";

const configPath = path.resolve(process.cwd(), "config.local.json");
if (!fs.existsSync(configPath)) {
  throw new Error(
    `Missing config.local.json at ${configPath}. Create it from the template and set databaseUrl/jwtSecret.`
  );
}

export const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

