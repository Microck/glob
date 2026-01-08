# Project Roadmap

1. [ ] **Show Faces/Polygon Counts**
   - Display vertex and face count for both original and optimized models in the comparison view.

2. [ ] **Add Mesh Preview**
   - Toggle wireframe mode in the 3D viewer to inspect topology.

3. [ ] **Add No-Texture Preview**
   - Toggle "Clay" or "Solid" mode to view geometry detail without texture distraction.

4. [ ] **Premium Accounts**
   - Implement user authentication.
   - Add tier-based limits (file size, history, priority queue).

5. [ ] **Privacy Policy and Terms**
   - Add legal pages footer.
   - Draft standard SaaS terms for 3D content processing.

6. [ ] **Temporary Share Link**
   - Generate a 24h expiration link to share the optimized result preview with others.

7. [ ] **Simplified Compression Strategy**
   - Replace complex sliders with a simple choice:
     - **Optimize for Size** (Aggressive texture compression, Draco)
     - **Optimize for Polygons** (Aggressive mesh decimation, keep textures quality)
