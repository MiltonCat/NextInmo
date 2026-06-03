const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMGS_DIR = path.join(__dirname, '..', 'public', 'imgs');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'imgs-optimized');
const MIN_SIZE_KB = 100; // Solo optimizar imágenes > 100KB
const TARGET_WIDTH = 1200; // Ancho máximo
const QUALITY = 82; // Calidad WebP

let totalOriginalSize = 0;
let totalOptimizedSize = 0;
let filesProcessed = 0;
let filesSkipped = 0;

async function optimizeImage(inputPath, outputPath) {
  const stats = fs.statSync(inputPath);
  const fileSizeKB = stats.size / 1024;

  if (fileSizeKB < MIN_SIZE_KB) {
    filesSkipped++;
    return null;
  }

  try {
    const info = await sharp(inputPath)
      .resize(TARGET_WIDTH, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outputPath);

    totalOriginalSize += stats.size;
    totalOptimizedSize += info.size;
    filesProcessed++;

    const savings = ((1 - info.size / stats.size) * 100).toFixed(1);
    console.log(`✅ ${path.basename(inputPath)} → ${(stats.size / 1024).toFixed(0)}KB → ${(info.size / 1024).toFixed(0)}KB (-${savings}%)`);
    
    return info;
  } catch (error) {
    console.error(`❌ Error procesando ${path.basename(inputPath)}:`, error.message);
    return null;
  }
}

async function processDirectory(dir, outputBase) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const inputPath = path.join(dir, entry.name);
    const relativePath = path.relative(IMGS_DIR, inputPath);
    const outputPath = path.join(outputBase, relativePath);

    if (entry.isDirectory()) {
      fs.mkdirSync(outputPath, { recursive: true });
      await processDirectory(inputPath, outputBase);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const outputFilePath = outputPath.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
        await optimizeImage(inputPath, outputFilePath);
      }
    }
  }
}

async function main() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  console.log(`📁 Origen: ${IMGS_DIR}`);
  console.log(`📁 Destino: ${OUTPUT_DIR}`);
  console.log(`⚙️  Configuración: max-width=${TARGET_WIDTH}px, quality=${QUALITY}, min-size=${MIN_SIZE_KB}KB\n`);

  if (!fs.existsSync(IMGS_DIR)) {
    console.error(`❌ No se encuentra la carpeta: ${IMGS_DIR}`);
    process.exit(1);
  }

  if (fs.existsSync(OUTPUT_DIR)) {
    console.log('🗑️  Limpiando carpeta de salida...');
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const startTime = Date.now();
  await processDirectory(IMGS_DIR, OUTPUT_DIR);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Archivos optimizados: ${filesProcessed}`);
  console.log(`⏭️  Archivos omitidos (<${MIN_SIZE_KB}KB): ${filesSkipped}`);
  console.log(`📦 Tamaño original: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Tamaño optimizado: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 Ahorro total: ${(totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB (${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%)`);
  console.log(`⏱️  Tiempo: ${duration}s`);
  console.log('='.repeat(60));
  console.log('\n✨ ¡Optimización completa!');
  console.log(`\n💡 Próximo paso: Reemplazar la carpeta /imgs con /imgs-optimized`);
  console.log(`   Comando: mv public/imgs public/imgs-backup && mv public/imgs-optimized public/imgs`);
}

main().catch(console.error);
