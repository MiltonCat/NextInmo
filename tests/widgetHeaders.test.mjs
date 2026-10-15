import test from "node:test";
import assert from "node:assert/strict";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server.js";
import nextConfig from "../next.config.mjs";

async function headers(path) {
  return (await unstable_getResponseFromNextConfig({ url: `https://example.com${path}`, nextConfig })).headers;
}

test("solo los widgets permiten inserción externa, con o sin barra final", async () => {
  for (const path of ["/tasador-demo/widget", "/demo/piloto/widget"]) {
    for (const suffix of ["", "/", "/?origen=externo"]) {
      const result = await headers(path + suffix);
      assert.equal(result.get("x-frame-options"), null, path + suffix);
      const csp = result.get("content-security-policy");
      assert.match(csp, /frame-ancestors 'self' https: http:/);
      assert.match(csp, /base-uri 'self'; form-action 'self'; object-src 'none'/);
      assert.equal(result.get("x-content-type-options"), "nosniff");
    }
  }
});

test("el resto del sitio y las rutas parecidas mantienen el bloqueo", async () => {
  for (const path of ["/", "/admin/", "/cuenta/", "/tasacion/", "/propiedades/", "/tasador-demo/", "/demo/piloto/", "/tasador-demo/widget/extra", "/demo/piloto/widget/extra", "/demo/piloto/widget-mal", "/demo/a/b/widget/", "/api/tasar/"]) {
    const result = await headers(path);
    assert.equal(result.get("x-frame-options"), "DENY", path);
    assert.match(result.get("content-security-policy"), /frame-ancestors 'none'/, path);
  }
});
