# Respalda los originales de las fotos del tasador FUERA del repo.
#
# Por que: los 8 archivos pesan 50,4 MB y estan por entrar a git. Se van a
# achicar a 2000 px dentro de public/, y los enlaces de Adobe Stock YA
# VENCIERON: si se achica sin respaldo, el original no se recupera.
#
# Este script NO borra ni modifica nada. Solo copia y verifica.
# Correr desde donde sea:  .\respaldar-fotos-originales.ps1

$ErrorActionPreference = 'Stop'

$origen  = 'C:\Cerebros\Dev\catalan-propiedades\nextjs\public'
$destino = 'C:\Cerebros\fotos-originales-tasacion'

$fotos = @(
    'deco-living-fiestas.jpg',
    'deco-living-fuego.jpg',
    'deco-living-moderno.jpg',
    'deco-living-ventanal.jpg',
    'deco-living-vigas.jpg',
    'tasacion-asesor.jpg',
    'tasacion-cuentas.jpg',
    'tasacion-ventana.jpg'
)

if (-not (Test-Path $destino)) {
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
    Write-Host "Carpeta creada: $destino" -ForegroundColor DarkGray
}

$ok = 0
$fallas = @()

foreach ($foto in $fotos) {
    $rutaOrigen  = Join-Path $origen  $foto
    $rutaDestino = Join-Path $destino $foto

    if (-not (Test-Path $rutaOrigen)) {
        Write-Host "  FALTA   $foto  (no esta en public/)" -ForegroundColor Yellow
        $fallas += $foto
        continue
    }

    Copy-Item -Path $rutaOrigen -Destination $rutaDestino -Force

    # Verificar que la copia sea identica byte a byte antes de dar el OK.
    $hashOrigen  = (Get-FileHash $rutaOrigen  -Algorithm SHA256).Hash
    $hashDestino = (Get-FileHash $rutaDestino -Algorithm SHA256).Hash
    $mb = [math]::Round((Get-Item $rutaOrigen).Length / 1MB, 1)

    if ($hashOrigen -eq $hashDestino) {
        Write-Host ("  OK      {0,-28} {1,6} MB" -f $foto, $mb) -ForegroundColor Green
        $ok++
    } else {
        Write-Host "  ERROR   $foto  (la copia no coincide)" -ForegroundColor Red
        $fallas += $foto
    }
}

Write-Host ""
Write-Host "Respaldados $ok de $($fotos.Count) en $destino"

if ($fallas.Count -gt 0) {
    Write-Host "NO seguir con el achique. Revisar: $($fallas -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "Listo. Se puede achicar." -ForegroundColor Green
