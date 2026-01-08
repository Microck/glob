# api/src

**Express + GLTF-Transform backend** - 3D model optimization API.

## WHERE TO LOOK

| Task | Location |
|------|----------|
| API entry | `server.ts` (PORT=3001) |
| Route handlers | `controllers/` |
| GLTF processing | `services/gltfService.ts` |

## CONVENTIONS

- Strict TypeScript (see `api/tsconfig.json`)
- `POST /api/optimize` - multipart/form-data for GLB/gltf
- Meshopt + Draco registered with NodeIO
- Uses `multer` for file uploads

## KEY SERVICES

- `gltfService.ts`: Decimation, Draco compression, Meshopt optimization
