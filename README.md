<p align="center">
  <a href="https://github.com/Microck/glob">
    <img src="/public/glob.png" alt="logo" width="200">
  </a>
</p>

<p align="center">glob is a high-performance glb compressor designed for aggressive mesh decimation and geometry optimization.</p>

<p align="center">
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-O’Saasy-pink.svg" /></a>
  <a href="https://nodejs.org/"><img alt="node" src="https://img.shields.io/badge/node-20+-blue.svg" /></a>
  <a href="https://react.dev/"><img alt="react" src="https://img.shields.io/badge/react-18-purple.svg" /></a>
</p>

---

### quickstart

**1. clone and prep**

```bash
git clone https://github.com/microck/glob.git
cd glob
npm install
```

**2. run the api**

```bash
# terminal 1
npm run api:dev
```

**3. run the frontend**

```bash
# terminal 2
npm run dev
```

Visit `http://localhost:5173` to start compressing. ensure you have your `.env` configured based on the `.env.example` provided.

---

### table of contents

*   [features](#features)
*   [how it works](#how-it-works)
*   [api reference](#api-reference)
*   [configuration](#configuration)
*   [troubleshooting](#troubleshooting)
*   [license](#license)

---

### features

glob isn't just a file uploader; it is a specialized 3d processing engine built to handle high-fidelity assets for web and mobile performance. it leverages the `gltf-transform` ecosystem to provide a predictable and non-destructive optimization path.

*   **mesh decimation:** intelligently reduces polygon count using the `meshoptimizer` simplifier. this allows you to target a specific percentage of the original geometry while maintaining the visual silhouette of the model.
*   **draco compression:** applies advanced geometry compression using the KHR_draco_mesh_compression extension. it significantly reduces the footprint of the geometry data, making it ideal for fast web delivery.
*   **texture optimization:** automatically resizes and compresses textures to a specified maximum resolution. the system identifies oversized textures and scales them down, ensuring your gpu memory isn't wasted on unnecessary pixels.
*   **bulk processing:** the "globber" tier supports batch optimization, allowing you to queue up to 10 files at once. the backend processes these sequentially and bundles the results into a single zip archive for easy download.
*   **storage quota:** persistence is handled via supabase, giving premium users a 1gb persistent storage quota. optimized models are stored in cloudflare r2 with signed urls for secure, ephemeral access.
*   **efficient ui:** a clean, high-contrast interface designed for maximum productivity. built with `shadcn/ui` and `tailwind css`, it prioritizes utility and speed over visual fluff.

---

### how it works

glob operates as a logic engine for gltf/glb processing. unlike simple zip compressors, it analyzes the underlying mesh data and applies a sequence of mathematical transforms to reduce data density while preserving visual fidelity.

the processing pipeline begins with **ingestion**, where the uploaded buffer is validated and parsed into a document object. if the model is a .gltf with external data uris, those are decoded and embedded into a temporary internal representation.

the core transformation follows a strict hierarchy. first, the model is **welded** to merge duplicate vertices, which is a prerequisite for effective simplification. then, the **decimation** algorithm (via meshopt) collapses edges based on the user-defined ratio. after geometry reduction, the system applies **quantization** to reduce the bit-depth of vertex attributes, followed finally by **draco compression**. this multi-layered approach ensures that the output is as small as theoretically possible for the web.

---

### api reference

#### `POST /api/optimize`

the primary endpoint for model optimization. it accepts `multipart/form-data` and handles both binary (.glb) and json-based (.gltf) inputs.

**settings schema:**

the `settings` field should be a stringified json object containing the following parameters:

```json
{
  "decimateRatio": 0.5,    // ratio of faces to keep (0.1 to 1.0)
  "dracoLevel": 7,        // compression effort level (0-10)
  "textureQuality": 2048, // maximum dimension for all textures
  "weld": true,           // whether to merge duplicate vertices before decimation
  "quantize": true        // whether to apply bit-depth quantization
}
```

**response structure:**

the api returns a status 200 on success with a payload containing both the download link and a detailed breakdown of the optimization gains, including face and vertex counts before and after the process.

```json
{
  "status": "success",
  "originalSize": 1542000,
  "optimizedSize": 432000,
  "downloadUrl": "https://api.glob.xyz/download/abc-123",
  "stats": {
    "facesBefore": 50000,
    "facesAfter": 25000,
    "verticesBefore": 32000,
    "verticesAfter": 16000
  }
}
```

---

### configuration

the system requires several integration points to function correctly. you will need to set up a supabase project for the database and authentication, a clerk instance for user management, and a cloudflare r2 bucket for file storage.

a full list of required environment variables is provided in `.env.example`. make sure to configure both the root level variables (for the express api) and the frontend variables (prefixed with `VITE_`) if you are running the full stack locally.

---

### troubleshooting

optimization is a destructive process by nature, and certain edge cases in the input geometry can lead to unexpected results.

| problem | likely cause | fix |
| :--- | :--- | :--- |
| **upload fails** | client-side limits | ensure your proxy (nginx/vercel) allows the file size in the request body. |
| **holes in mesh** | low decimateRatio | increase the ratio or ensure the 'weld' setting is enabled to keep the mesh manifold. |
| **textures missing** | external gltf links | glob does not support gltf files with external .bin or image files. use .glb instead. |
| **cors error** | origin mismatch | the backend strictly validates the `Origin` header. verify your `CORS_ORIGINS` config. |

---

### license

this software is released under the **o'saasy license**. it is free for personal and internal business use, but you are strictly prohibited from using it to build a competing hosted 3d optimization service.

---

### to-do
- [ ] implementation of glb to usd conversion for visionos support
- [ ] real-time 3d preview toggle to compare original vs optimized mesh
- [ ] auto-generation of lod (level of detail) chains for game engine integration
- [ ] pwa support for local optimization using client-side wasm
