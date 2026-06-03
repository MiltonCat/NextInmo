const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const outDir = path.resolve(__dirname, "../out");
const zipPath = path.resolve(__dirname, "../out.zip");

if (!fs.existsSync(outDir)) {
  console.error("La carpeta 'out' no existe. Ejecutá 'next build' primero.");
  process.exit(1);
}

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

const absOut = outDir.replace(/\\/g, "\\\\");
const absZip = zipPath.replace(/\\/g, "\\\\");

execSync(
  `powershell -Command "Add-Type -Assembly System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${absOut}', '${absZip}')"`,
  { stdio: "inherit" }
);

console.log(`\n✓ out.zip generado en: ${zipPath}`);
