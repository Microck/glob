<p align="center">
  <a href="https://glob.micr.dev">
    <img src="public/glob.png" alt="logo" width="200">
  </a>
</p>

<p align="center">glb/gltf optimizer. i got tired of spammy online compressors, so i built my own.</p>

<p align="center">
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-O’Saasy-pink.svg" /></a>
  <a href="https://nodejs.org/"><img alt="node" src="https://img.shields.io/badge/node-20+-blue.svg" /></a>
  <a href="https://react.dev/"><img alt="react" src="https://img.shields.io/badge/react-18-purple.svg" /></a>
  <a href="https://polar.sh/"><img alt="polar" src="https://img.shields.io/badge/commerce-polar-white.svg" /></a>
</p>

<p align="center">
  <video src="https://github.com/user-attachments/assets/19ad4511-9b2d-4a19-9901-6f630ca55b99" alt="glob video" />
</p>

---

### features

glob is a logic engine for shrinking 3d assets. i built it because 50mb glb files shouldn't exist on the web.

- **mesh decimation:** removes polygons using `meshoptimizer`. drops weight without losing silhouette.
- **draco compression:** google's geometry compression for minimal footprint.
- **model sharing:** generate persistent share links with interactive 3D previews and stats.
- **texture resizing:** auto-scale textures to 1k/2k/4k limits. saves vram.
- **bulk processing:** queue 10 files. get them back optimized.
- **globber tier:** $8/mo via polar. 500mb limits, 48h retention, persistent vault.

---

### how it works

```mermaid
flowchart LR
    A[Upload] --> B(Welding)
    B --> C(Decimation)
    C --> D(Quantization)
    D --> E(Draco)
    E --> F[Optimized GLB]
```

1. **ingest:** parses buffer into document object.
2. **weld:** merges duplicate vertices. essential before simplification.
3. **decimate:** collapses edges based on target ratio.
4. **quantize:** reduces bit-depth of attributes.
5. **compress:** applies draco for final reduction.

---

### stack

- **frontend:** react, vite, tailwind, shadcn, three.js
- **backend:** express, node, gltf-transform
- **deploy:** vercel (frontend + `/api`)
- **infra:** supabase (db), cloudflare r2 (model storage), clerk (auth), polar (billing)
- **note:** `render.yaml` exists if you want a long-running api

---

### self-hosting

you can run glob on your own infrastructure. it's a standard node/vite stack.

1. **clone**: `git clone https://github.com/microck/glob.git`
2. **deps**: `npm install`
3. **env**: rename `.env.example` to `.env` and fill in the blanks.
4. **run**: `npm run dev` and `npm run api:dev`

you'll need accounts for:
- **supabase**: database. run migrations in `api/supabase`.
- **clerk**: auth. create an app and get keys.
- **cloudflare r2**: object storage. create a bucket.
- **polar**: payments. strictly optional if you strip the billing code.

---

### license

o'saasy license. use it for internal tools or personal projects. don't use this code to launch a competing 3d optimization service.
