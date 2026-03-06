import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

interface FileSizeInfo {
  path: string;
  bytes: number;
}

function run(command: string): string {
  return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function toMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function listTrackedFiles(): string[] {
  const output = run("git ls-files");
  return output.split(/\r?\n/).filter(Boolean);
}

function getTrackedFileSizes(files: string[]): FileSizeInfo[] {
  const result: FileSizeInfo[] = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      const stats = statSync(file);
      if (stats.isFile()) {
        result.push({ path: file, bytes: stats.size });
      }
    } catch {
      // Ignore files that cannot be stat-ed.
    }
  }
  return result;
}

function collectAssetImports(files: string[]): Set<string> {
  const used = new Set<string>();
  const sourceFiles = files.filter((f) =>
    f.startsWith("client/src/") && /\.(ts|tsx|js|jsx)$/.test(f),
  );

  const importRegex = /@assets\/([^"'`\n\r]+)/g;

  for (const file of sourceFiles) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, "utf8");
    let match: RegExpExecArray | null = null;
    while ((match = importRegex.exec(content)) !== null) {
      used.add(match[1]);
    }
  }

  return used;
}

function main() {
  const failOnLarge = process.argv.includes("--fail-on-large");
  const maxFileMB = Number(process.env.MAX_FILE_MB || "20");
  const maxAttachedMB = Number(process.env.MAX_ATTACHED_ASSETS_MB || "300");

  const trackedFiles = listTrackedFiles();
  const fileSizes = getTrackedFileSizes(trackedFiles);

  const totalBytes = fileSizes.reduce((sum, f) => sum + f.bytes, 0);
  const sorted = [...fileSizes].sort((a, b) => b.bytes - a.bytes);
  const top30 = sorted.slice(0, 30);

  const largeFiles = sorted.filter((f) => f.bytes > maxFileMB * 1024 * 1024);

  const attachedFiles = fileSizes.filter((f) => f.path.startsWith("attached_assets/"));
  const attachedTotal = attachedFiles.reduce((sum, f) => sum + f.bytes, 0);

  const usedAssets = collectAssetImports(trackedFiles);
  const unusedAttached = attachedFiles.filter((f) => {
    const base = path.basename(f.path);
    return !usedAssets.has(base);
  });

  console.log("=== WytNet Repo Audit ===");
  console.log(`Tracked files: ${fileSizes.length}`);
  console.log(`Tracked size: ${toMB(totalBytes)} MB`);
  console.log("");

  console.log("Top 30 largest tracked files:");
  for (const file of top30) {
    console.log(`- ${file.path} (${toMB(file.bytes)} MB)`);
  }

  console.log("");
  console.log(`attached_assets files: ${attachedFiles.length}`);
  console.log(`attached_assets total: ${toMB(attachedTotal)} MB`);
  console.log(`attached_assets imported in client code: ${usedAssets.size}`);
  console.log(`attached_assets not directly imported: ${unusedAttached.length}`);

  if (unusedAttached.length > 0) {
    console.log("\nTop 20 non-imported attached assets (candidate review list):");
    for (const file of unusedAttached.slice(0, 20).sort((a, b) => b.bytes - a.bytes)) {
      console.log(`- ${file.path} (${toMB(file.bytes)} MB)`);
    }
  }

  console.log("");
  console.log(`Threshold max file: ${maxFileMB} MB`);
  console.log(`Threshold attached_assets total: ${maxAttachedMB} MB`);

  let shouldFail = false;

  if (largeFiles.length > 0) {
    console.log(`\nFiles over threshold (${maxFileMB} MB):`);
    for (const file of largeFiles) {
      console.log(`- ${file.path} (${toMB(file.bytes)} MB)`);
    }
    shouldFail = true;
  }

  if (attachedTotal > maxAttachedMB * 1024 * 1024) {
    console.log(
      `\nattached_assets total exceeds threshold: ${toMB(attachedTotal)} MB > ${maxAttachedMB} MB`,
    );
    shouldFail = true;
  }

  if (failOnLarge && shouldFail) {
    process.exit(1);
  }
}

main();
