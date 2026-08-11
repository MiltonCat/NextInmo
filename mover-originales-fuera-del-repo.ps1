# Mueve los 4 JPG originales sin usar de public/ a una carpeta fuera del repo.
#
# Por que existe: pesan 5,67 MB juntos, ninguno esta referenciado en el codigo
# y no hace falta versionarlos. Los .webp que si se publican (80 KB) se quedan.
# Es el mismo problema del commit e593689 (48,3 MB de fotos del tasador).
#
# No borra nada: mueve. Si algo sale mal el archivo esta en el destino.
# No renombra nada: los nombres se conservan tal cual.
#
# Correr desde cualquier lado:  pwsh -File .\mover-originales-fuera-del-repo.ps1
# Para ver que haria sin tocar: pwsh -File .\mover-originales-fuera-del-repo.ps1 -DryRun

param(
    [switch]$DryRun,
    [string]$Destino = 'C:\Cerebros\Dev\catalan-propiedades\_originales-fotos'
)

$ErrorActionPreference = 'Stop'

$repo   = 'C:\Cerebros\Dev\catalan-propiedades\nextjs'
$public = Join-Path $repo 'public'

# Cada original con el .webp que lo reemplaza. $null = nunca se uso en el sitio,
# asi que no hay nada que verificar antes de moverlo.
$archivos = @(
    @{ Original = 'grafico1.jpg'; Webp = 'grafico1.webp'; Nota = 'mujer con informes; el .webp existe pero hoy tampoco se usa' }
    @{ Original = 'grafico3.jpg'; Webp = 'grafico3.webp'; Nota = 'portapapeles; el .webp SI se publica en /inversiones' }
    @{ Original = 'graficos.jpg'; Webp = $null;           Nota = 'indice Wilshire, bolsa de EE.UU.; nunca se uso' }
    @{ Original = 'casa1.jpg';    Webp = $null;           Nota = 'casitas y billetes en euros; nunca se uso' }
)

if (-not (Test-Path $public)) {
    throw "No encuentro $public. Revisa la ruta del repo."
}

Write-Host ''
Write-Host "Origen : $public"
Write-Host "Destino: $Destino"
if ($DryRun) { Write-Host 'MODO PRUEBA: no se mueve nada.' -ForegroundColor Yellow }
Write-Host ''

# --- Chequeos antes de tocar nada -------------------------------------------

$aMover = @()
$problemas = @()

foreach ($a in $archivos) {
    $origen = Join-Path $public $a.Original

    if (-not (Test-Path $origen)) {
        Write-Host "  - $($a.Original): ya no esta en public/, se saltea." -ForegroundColor DarkGray
        continue
    }

    # Si el original tiene un .webp derivado, ese .webp tiene que seguir ahi.
    # Mover el JPG cuando el webp no existe dejaria la pagina sin imagen.
    if ($a.Webp) {
        $webp = Join-Path $public $a.Webp
        if (-not (Test-Path $webp)) {
            $problemas += "$($a.Original): falta $($a.Webp) en public/. No lo muevo."
            continue
        }
    }

    # Nunca pisar un archivo en el destino.
    $destinoFinal = Join-Path $Destino $a.Original
    if (Test-Path $destinoFinal) {
        $problemas += "$($a.Original): ya existe en el destino. No lo piso."
        continue
    }

    $aMover += [pscustomobject]@{
        Nombre  = $a.Original
        Origen  = $origen
        Destino = $destinoFinal
        MB      = [math]::Round((Get-Item $origen).Length / 1MB, 2)
        Nota    = $a.Nota
    }
}

if ($problemas.Count -gt 0) {
    Write-Host 'Frena esto:' -ForegroundColor Red
    $problemas | ForEach-Object { Write-Host "  ! $_" -ForegroundColor Red }
    Write-Host ''
    if (-not $DryRun) { throw 'No se movio nada. Revisa lo de arriba.' }
}

if ($aMover.Count -eq 0) {
    Write-Host 'No hay nada para mover.' -ForegroundColor Green
    return
}

$aMover | ForEach-Object {
    Write-Host ("  {0,-16} {1,6} MB   {2}" -f $_.Nombre, $_.MB, $_.Nota)
}
$total = [math]::Round(($aMover | Measure-Object -Property MB -Sum).Sum, 2)
Write-Host ''
Write-Host "Total: $total MB en $($aMover.Count) archivos."
Write-Host ''

if ($DryRun) { return }

# --- Mover -------------------------------------------------------------------

if (-not (Test-Path $Destino)) {
    New-Item -ItemType Directory -Path $Destino -Force | Out-Null
    Write-Host "Carpeta creada: $Destino"
}

foreach ($m in $aMover) {
    Move-Item -LiteralPath $m.Origen -Destination $m.Destino
    Write-Host "  movido  $($m.Nombre)" -ForegroundColor Green
}

# --- Verificar despues -------------------------------------------------------

Write-Host ''
$fallas = @()
foreach ($m in $aMover) {
    if (Test-Path $m.Origen)         { $fallas += "$($m.Nombre) sigue en public/" }
    if (-not (Test-Path $m.Destino)) { $fallas += "$($m.Nombre) no llego al destino" }
}

# Los .webp que se publican tienen que seguir en su lugar.
foreach ($w in @('grafico3.webp', 'grafico1.webp', 'hero-lago.webp')) {
    if (-not (Test-Path (Join-Path $public $w))) { $fallas += "OJO: falta $w en public/" }
}

if ($fallas.Count -gt 0) {
    Write-Host 'Verificacion con problemas:' -ForegroundColor Red
    $fallas | ForEach-Object { Write-Host "  ! $_" -ForegroundColor Red }
} else {
    Write-Host "Listo. $total MB fuera del repo, los .webp publicados intactos." -ForegroundColor Green
    Write-Host ''
    Write-Host 'Despues de esto:'
    Write-Host '  git status    -> los 4 .jpg ya no deberian aparecer como sin seguimiento'
    Write-Host '  npm run build -> todavia pendiente antes de deployar'
}
