import fs from "fs";
import path from "path";

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

function replaceColors(content: string) {
  return content
    .replace(/text-purple-[0-9]+/g, "text-[var(--brand-light)]")
    .replace(/bg-purple-[0-9]+\/[0-9]+/g, "bg-[var(--brand-dark)]")
    .replace(/bg-purple-[0-9]+/g, "bg-[var(--brand-primary)]")
    .replace(/border-purple-[0-9]+\/[0-9]+/g, "border-[var(--brand-border)]")
    .replace(/border-purple-[0-9]+/g, "border-[var(--brand-primary)]")
    .replace(/via-purple-[0-9]+/g, "via-[var(--brand-primary)]")
}

walkDir("./src", function(filePath) {
  if (filePath.endsWith(".tsx")) {
    const original = fs.readFileSync(filePath, "utf-8");
    const updated = replaceColors(original);
    if (original !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`Updated ${filePath}`);
    }
  }
});
