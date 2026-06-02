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
    .replace(/text-purple-400/g, "text-[var(--brand-light)]")
    .replace(/text-purple-300/g, "text-white")
    .replace(/bg-purple-500/g, "bg-[var(--brand-primary)]")
    .replace(/bg-purple-400/g, "bg-[var(--brand-light)]")
    .replace(/border-purple-500/g, "border-[var(--brand-primary)]")
    .replace(/bg-purple-950\/[0-9]+/g, "bg-[var(--brand-dark)]")
    .replace(/bg-purple-950/g, "bg-[var(--brand-dark)]")
    .replace(/text-purple-600/g, "text-[var(--brand-primary)]")
    .replace(/focus:ring-purple-500/g, "focus:ring-[var(--brand-primary)]")
    .replace(/border-purple-800\/40/g, "border-[var(--brand-border)]")
    .replace(/border-purple-900\/30/g, "border-[var(--brand-border)]")
    .replace(/shadow-purple-[0-9]+\/[0-9]+/g, "")
    .replace(/hover:border-purple-800\/40/g, "hover:border-[var(--brand-primary)]")
    .replace(/accent-purple-500/g, "accent-[var(--brand-primary)]")
    .replace(/hover:accent-purple-400/g, "hover:accent-[var(--brand-light)]")
    .replace(/from-purple-950\/20/g, "from-[var(--brand-dark)]")
    .replace(/from-purple-[0-9]+/g, "from-[var(--brand-primary)]")
    .replace(/to-purple-[0-9]+/g, "to-[var(--brand-light)]")
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
