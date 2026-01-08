# Implementation Plan: UI Fixes and Debug Console

## Overview
This plan addresses user-reported UI interaction issues in the Controls component (canvas resizing on +/- button click, incorrect increment steps, z-index issues) and adds a comprehensive debug console for the processing state.

## Tasks

### 1. Fix Controls Component UI Bugs
- [ ] Read `src/components/Controls.tsx` to understand current implementation of `NumberInput` and event handling
- [ ] Fix canvas resize trigger: Replace `onMouseDown` with `onPointerDown` and add `pointer-events-auto`
- [ ] Fix increment steps: Change MB step to 1 (was 0.1) and ensure Polygons step is 1000
- [ ] Fix Polygon buttons: Verify state binding and update logic for `desiredPolygons`
- [ ] Fix Tooltip Z-Index: Add `z-50` to `TooltipContent` to prevent overlapping issues
- [ ] Verify fix: Re-build frontend to ensure no regression

### 2. Prevent Model Preview Layout Shifts
- [ ] Read `src/pages/Index.tsx` and `src/components/GLBViewer.tsx` to check layout responsiveness
- [ ] Modify layout constraints to ensure controls don't shift the 3D canvas
- [ ] Verify fix: Re-build frontend

### 3. Implement Debug Console Overlay
- [ ] Create `src/components/DebugConsole.tsx` component
  - [ ] Props: `isVisible`, `currentMessage`, `progress`, `settings` (object), `stats` (object)
  - [ ] Layout: Overlay positioned on top of loading/compressing screen
  - [ ] Content: Detailed JSON view of settings, stats, and real-time progress logs
- [ ] Integrate `DebugConsole` into `src/pages/Index.tsx`
  - [ ] Add state for debug console visibility (toggle with key combo or UI button)
  - [ ] Pass real-time data from `handleCompress` to the console
- [ ] Verify implementation: Build and test the loading flow with debug console active

### 4. Final Verification
- [ ] Run full build: `npm run build && npm run api:build`
- [ ] Verify no lint errors or type issues
