<p align="center">
  <a href="https://glob.micr.dev">
    <img src="public/glob.png" alt="logo" width="200">
  </a>
</p>

<p align="center">high-performance glb compressor for aggressive mesh decimation and geometry optimization.</p>

<p align="center">
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-O’Saasy-pink.svg" /></a>
  <a href="https://nodejs.org/"><img alt="node" src="https://img.shields.io/badge/node-20+-blue.svg" /></a>
  <a href="https://react.dev/"><img alt="react" src="https://img.shields.io/badge/react-18-purple.svg" /></a>
  <a href="https://polar.sh/"><img alt="polar" src="https://img.shields.io/badge/commerce-polar-white.svg" /></a>
</p>

---

### quickstart

**clone and prep**

```bash
git clone https://github.com/microck/glob.git
cd glob
npm install
```

**env setup**

copy `.env.example`. fill in the keys. you need supabase, clerk, polar, and r2.

```bash
# frontend
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_API_URL=http://localhost:3001

# backend
CLERK_SECRET_KEY=...
R2_BUCKET_NAME=glob-models
POLAR_ACCESS_TOKEN=...
POLAR_SUCCESS_URL=http://localhost:5173/success?checkout_id={CHECKOUT_ID}
```

**run it**

you need two terminals.

```bash
# terminal 1
npm run api:dev

# terminal 2
npm run dev
```

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
- **infra:** cloudflare r2 (storage), supabase (auth/db), clerk (auth), polar (payments)

---

### license

o'saasy license. use it for internal tools or personal projects. don't use this code to launch a competing 3d optimization service.
