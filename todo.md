# Project Roadmap

1. [x] **Show Faces/Polygon Counts**
   - Display vertex and face count for both original and optimized models in the comparison view.

2. [x] **Add Mesh Preview**
   - Toggle wireframe mode in the 3D viewer to inspect topology.

3. [x] **Add No-Texture Preview**
   - Toggle "Clay" or "Solid" mode to view geometry detail without texture distraction.

4. [x] **Privacy Policy and Terms**
   - Add legal pages footer.
   - Draft standard SaaS terms for 3D content processing.

5. [x] **Temporary Share Link**
   - Generate a temporary link to share the optimized result preview.
   - **Non-Premium**: 1 hour expiration.
   - **Premium**: 24-48 hours expiration.
   - Implemented expiration logic (backend), Share page (frontend), and Share button.

6. [x] **Premium Accounts**
   - Implemented user authentication with Clerk.
   - Added tier-based limits:
     - **Free**: 50MB file limit, 1h share links.
     - **globber**: 500MB file limit, 48h share links, permanent history.
   - Added "Recent Optimizations" history for logged-in users.
   - Integrated with Polar.sh for usage-based billing and subscriptions.

7. [x] **Simplified Compression Strategy**
   - Replace complex sliders with a simple choice:
     - **Optimize for Size** (Aggressive texture compression, Draco)
     - **Optimize for Polygons** (Aggressive mesh decimation, keep textures quality)
   - Implemented Simple (Target-based) vs Advanced (Manual) modes.
   - Added numeric inputs for specific size/polygon targets with validation.
   - Expanded Advanced settings with Weld, Quantize, Draco toggles and Texture resolution.

8. [x] **Viewer Improvements**
   - Implemented "Center Model" button functionality.
   - Adjusted default zoom to 90% for better object framing.
