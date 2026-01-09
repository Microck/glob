# Brutalist GLB Compressor

This repo contains:

- Frontend: Vite + React (`npm run dev`)
- Backend: Express + TypeScript optimization API (`npm run api:dev`)

## Features

- **Mesh Decimation**: Reduce polygon count intelligently.
- **Draco Compression**: Apply advanced geometry compression.
- **Texture Optimization**: Resize and compress textures.
- **Bulk Processing (Globber)**: Convert up to 10 files at once with ZIP download (Premium).
- **Storage Quota**: Manage up to 1GB of optimized assets (Premium).

## Backend: 3D Optimization API

### Dependencies (backend-related)

Installed at the repo root `package.json`:

- `express`, `cors`, `multer`
- `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions`
- `meshoptimizer` (Meshopt simplifier)
- `draco3d` (Draco encoder/decoder)

### Running

```bash
npm run api:dev
# API listens on PORT=3001 by default
```

### Endpoint

`POST /api/optimize` (multipart/form-data)

- `file`: `.glb` or `.gltf`
- `settings`: JSON string

Example settings:

```json
{
  "decimateRatio": 0.5,
  "dracoLevel": 7,
  "textureQuality": 2048
}
```

Response:

```json
{
  "status": "success",
  "originalSize": 123,
  "optimizedSize": 45,
  "downloadUrl": "http://localhost:3001/api/download/<id>",
  "stats": { "facesBefore": 1000, "facesAfter": 500 }
}
```

### How Meshopt + Draco are registered with glTF-Transform

In `api/src/services/gltfService.ts` the reusable `NodeIO` instance registers the required native/wasm dependencies:

- Meshopt decoder/encoder (for reading/writing Meshopt-compressed content):

```ts
io.registerDependencies({
  "meshopt.decoder": MeshoptDecoder,
  "meshopt.encoder": MeshoptEncoder,
});
```

- Draco decoder/encoder (for reading existing Draco assets and writing compressed output):

```ts
io.registerExtensions([KHRDracoMeshCompression]).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule({}),
  "draco3d.encoder": await draco3d.createEncoderModule({}),
});
```

The decimation step uses Meshopt's simplifier directly:

```ts
await document.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio: decimateRatio, error: 0.001 }),
);
```
