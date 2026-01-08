# Task 2: Add Mesh Preview - Handoff

## Goal
Implement a wireframe toggle in the 3D viewer to inspect topology.

## Progress
- Modified `src/components/ComparisonViewer.tsx`:
  - Added `wireframe` state and `Switch` toggle UI in the info bar.
  - Updated `Model` component to accept `wireframe` prop.
  - Optimized `Model` component with `useMemo` to efficiently handle scene cloning and material restoration.
  - Ensured wireframe mode applies to both "Original" and "Optimized" views.

## What Worked
- Re-cloning the scene when `wireframe` state changes proved to be the most robust way to handle material switching/restoration without complex state management for original materials.
- Using `useMemo` for the scene clone prevents unnecessary re-cloning during slider interaction, maintaining performance.

## Next Steps
- Consider adding the same wireframe toggle to `GLBViewer.tsx` for consistency in the "preview" stage (before optimization).
- Verify performance on very large models (re-cloning might cause a hiccup when toggling wireframe, but it's an acceptable trade-off for correctness).
