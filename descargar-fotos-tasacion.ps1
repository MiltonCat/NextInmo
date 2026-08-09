# Baja las fotos de Adobe Stock ya licenciadas y las deja en public/ con el
# nombre que espera app/tasacion/page.js. Se ejecuta una sola vez.
#
#   powershell -ExecutionPolicy Bypass -File .\descargar-fotos-tasacion.ps1
#
# Los enlaces vencen una hora despues de generados (07/08/2026, 23:36 UTC). Si
# ya vencieron, avisame y los regenero: las fotos estan compradas, refrescar el
# enlace no gasta creditos nuevos.

$ErrorActionPreference = "Stop"
$destino = Join-Path $PSScriptRoot "public"

$fotos = @(
  @{
    nombre = "tasacion-ventana.jpg"
    detalle = "Seccion: esto el modelo no lo puede tasar (AdobeStock 391213057)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/3bce3572f226635e923b9627c7e513bf5eaa5f30cc5bd477bc8563a0a49b84c2.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_391213057.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T231800Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=75914a2350d7c3a7bd85196a4ab303b3f0fae9007948ed95c12a07045daede1b"
  },
  @{
    nombre = "tasacion-cuentas.jpg"
    detalle = "Seccion: el mercado no se queda quieto (AdobeStock 349623503)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/908b2aa20066f62c44a2da91246762ba0fe32ede08be08503f2896681e53a82b.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_349623503.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T231806Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=8bc250967f4d07ce00d921a89fc76dfde103a0d05ca7b4023ccf7ac7011835bf"
  },
  @{
    nombre = "deco-living-vigas.jpg"
    detalle = "Carrusel: vigas a la vista (AdobeStock 588113561)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/b28e7a3ca47de030c68ed02c4a73675305bf4b6d0d8a8383f59abd4f571f4bc7.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_588113561.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T233552Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=56a5db25b1617a41609489e3a01532a78d6bed0664523dd6d2747e4fbeced8d6"
  },
  @{
    nombre = "deco-living-moderno.jpg"
    detalle = "Carrusel: ventanal de piso a techo (AdobeStock 572661849)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/47bc800e3788478871117a3d8dd447052ab8df68c1d2ff9c12ab006b5f201cc6.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_572661849.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T233558Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=c00f500832ac11ed9c25156644520ed7f89943f3e7b377854d0c84f1808498d9"
  },
  @{
    nombre = "deco-living-ventanal.jpg"
    detalle = "Carrusel: el hogar como centro (AdobeStock 454861243)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/6d993f4154eeb3437f5f024f1391db7ab955f65d0526b8380cd8c75a3a178a99.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_454861243.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T233612Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=7086a47dddd4aa5f63fd9169b79543ada2675277203090f935c194bdea589557"
  },
  @{
    nombre = "deco-living-fuego.jpg"
    detalle = "Carrusel: para el invierno largo (AdobeStock 405282119)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/a2d5a98fd918f52dceabfe49009516040e9c8c10b5aed7231b1d798b30692db5.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_405282119.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T233618Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=8a13390ae410628dc2388a6c54d92922adeb5022024cfab29f559a4fb3b6d630"
  },
  @{
    nombre = "deco-living-fiestas.jpg"
    detalle = "Carrusel: listo para recibir (AdobeStock 318399628)"
    url = "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/176a640e20ae466bf9496958ff26ebac4eb3b7c5ab908a92538f7b6ced5484a0.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_318399628.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20260807%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20260807T233624Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=91fcf1a704e17b43b38247e31e0c6d76c08f0e4da7e5b88d856e1c4e3e234f32"
  }
)

Write-Host ""
Write-Host "Destino: $destino"
Write-Host ""

$fallaron = 0
foreach ($foto in $fotos) {
  $salida = Join-Path $destino $foto.nombre
  Write-Host "Bajando $($foto.nombre)"
  Write-Host "   $($foto.detalle)" -ForegroundColor DarkGray
  try {
    Invoke-WebRequest -Uri $foto.url -OutFile $salida -UseBasicParsing
    $kb = [math]::Round((Get-Item $salida).Length / 1KB)
    Write-Host "   listo, $kb KB" -ForegroundColor Green
  } catch {
    $fallaron++
    Write-Host "   FALLO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Si dice Access Denied o 403, el enlace vencio. Pedime que lo regenere." -ForegroundColor Yellow
  }
}

Write-Host ""
if ($fallaron -eq 0) {
  Write-Host "Las $($fotos.Count) fotos quedaron en public/. Recarga localhost:3000/tasacion" -ForegroundColor Green
} else {
  Write-Host "$fallaron de $($fotos.Count) fallaron." -ForegroundColor Red
}
Write-Host ""
