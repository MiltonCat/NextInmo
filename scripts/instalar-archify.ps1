#requires -Version 5.1
<#
    instalar-archify.ps1
    Instala la agent skill Archify (tt-a1i/archify, licencia MIT) de forma global.

    Que toca este script:
      - Crea/actualiza  <TU PERFIL>\.claude\skills\archify   (si usas -Agente claude-code)
      - Si esa carpeta ya existe, la renombra a archify.bak-<fecha> antes de tocar nada
      - No modifica el repo, ni tu perfil de PowerShell, ni settings de Traycer

    Uso (desde la raiz del repo):
      .\scripts\instalar-archify.ps1                 # instala para Claude Code
      .\scripts\instalar-archify.ps1 -Simular        # muestra que haria, sin ejecutar
      .\scripts\instalar-archify.ps1 -Agente cursor  # otros: codex, opencode

    Atajo equivalente, sin este script:
      npx skills add tt-a1i/archify -g
#>

[CmdletBinding()]
param(
    [ValidateSet('claude-code', 'cursor', 'codex', 'opencode')]
    [string] $Agente = 'claude-code',

    [switch] $Simular
)

$ErrorActionPreference = 'Stop'

function Escribir-Paso { param([string] $Texto) Write-Host "`n==> $Texto" -ForegroundColor Cyan }
function Escribir-Ok   { param([string] $Texto) Write-Host "    OK  $Texto" -ForegroundColor Green }
function Escribir-Aviso{ param([string] $Texto) Write-Host "    !   $Texto" -ForegroundColor Yellow }

Write-Host "Instalador de Archify" -ForegroundColor White
Write-Host "Agente destino: $Agente"
if ($Simular) { Write-Host "MODO SIMULACION: no se ejecuta ni se escribe nada." -ForegroundColor Yellow }

# ---------------------------------------------------------------- 1. Node.js
Escribir-Paso 'Verificando Node.js'

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host ''
    Write-Host 'No se encontro Node.js en el PATH.' -ForegroundColor Red
    Write-Host 'Instalalo desde https://nodejs.org (LTS) y volve a correr este script.'
    exit 1
}

$versionNode = (& node --version).Trim()
$mayor = [int]($versionNode -replace '^v(\d+).*$', '$1')
if ($mayor -lt 18) {
    Write-Host ''
    Write-Host "Node $versionNode es demasiado viejo. Archify necesita 18 o superior." -ForegroundColor Red
    exit 1
}
Escribir-Ok "Node $versionNode  ($($node.Source))"

$npx = Get-Command npx -ErrorAction SilentlyContinue
if (-not $npx) {
    Write-Host 'No se encontro npx (viene con npm). Reinstala Node.js.' -ForegroundColor Red
    exit 1
}
Escribir-Ok "npx disponible"

# ------------------------------------------------- 2. Carpeta destino / backup
$destino = $null
if ($Agente -eq 'claude-code') {
    $destino = Join-Path $env:USERPROFILE '.claude\skills\archify'
}

if ($destino) {
    Escribir-Paso 'Revisando instalacion previa'
    if (Test-Path -LiteralPath $destino) {
        $sello  = Get-Date -Format 'yyyyMMdd-HHmmss'
        $backup = "$destino.bak-$sello"
        Escribir-Aviso "Ya existe: $destino"
        Escribir-Aviso "Se renombra a: $backup"
        if (-not $Simular) {
            Rename-Item -LiteralPath $destino -NewName (Split-Path $backup -Leaf)
            Escribir-Ok 'Copia de seguridad hecha'
        }
    }
    else {
        Escribir-Ok 'No hay instalacion previa; se instala limpio'
    }
}

# ------------------------------------------------------------ 3. Instalacion
Escribir-Paso 'Instalando Archify'

$argumentos = @(
    '-y', 'skills', 'add', 'tt-a1i/archify',
    '--skill',  'archify',
    '--agent',  $Agente,
    '--global',
    '--copy',
    '--yes'
)

Write-Host "    npx $($argumentos -join ' ')" -ForegroundColor DarkGray

if ($Simular) {
    Write-Host ''
    Write-Host 'Simulacion terminada. Nada fue instalado.' -ForegroundColor Yellow
    exit 0
}

& npx @argumentos
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host "La instalacion fallo (codigo $LASTEXITCODE)." -ForegroundColor Red
    Write-Host 'Si hay un backup .bak-<fecha> al lado, podes restaurarlo renombrandolo.'
    exit $LASTEXITCODE
}

# ------------------------------------------------------------ 4. Verificacion
Escribir-Paso 'Verificando'

if ($destino) {
    $skillMd = Join-Path $destino 'SKILL.md'
    if (Test-Path -LiteralPath $skillMd) {
        Escribir-Ok "Instalado en: $destino"
        $archivos = (Get-ChildItem -LiteralPath $destino -Recurse -File | Measure-Object).Count
        Escribir-Ok "$archivos archivos"
    }
    else {
        Escribir-Aviso "No se encontro SKILL.md en $destino"
        Escribir-Aviso 'Revisa la salida de npx de arriba.'
    }
}
else {
    Escribir-Ok 'Instalacion delegada al instalador de skills; revisa su salida arriba.'
}

Write-Host ''
Write-Host 'Listo.' -ForegroundColor Green
Write-Host 'Opcional, para que Archify no haga ningun chequeo de version por red:'
Write-Host '    [Environment]::SetEnvironmentVariable("ARCHIFY_UPDATE_CHECK_DISABLED", "1", "User")' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Probalo abriendo Claude Code en el repo y pidiendo:' -ForegroundColor White
Write-Host '    Usa Archify para mapear la arquitectura de este proyecto' -ForegroundColor DarkGray
