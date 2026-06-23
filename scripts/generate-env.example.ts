import { writeFile } from "node:fs/promises";

async function main(): Promise<void> {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://localhost/mydb";
  process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "";
  process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";
  process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
  process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
  process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "placeholder-secret-min-32-chars-long!!!!!";
  process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  try {
    const { default: config } = await import("../auth.config.ts");
    const { generateEnvExample } = await import("./lib/generate-env");
    const content = generateEnvExample(config);
    await writeFile(".env.example", content, "utf-8");
    console.log("Generated .env.example");
  } catch (error) {
    console.error("Failed to generate .env.example:", error);
    process.exit(1);
  }
}

main();
