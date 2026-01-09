# Handoff: Bulk Convert & Storage Quota

**Status:** Completed
**Date:** 2026-01-09

## Features Implemented
1.  **Bulk Conversion**:
    -   Globber users can drag-and-drop up to **10 files** at once.
    -   Files are processed sequentially with a new "File Queue" and "Progress List" UI.
    -   Results are displayed in a summary table with a "Download Selected (ZIP)" option.
    -   Viewer allows navigating between processed files without leaving the view.

2.  **Storage Quota**:
    -   Globber users have a **1GB total storage limit**.
    -   Usage is tracked in the database and enforced before each upload.
    -   History UI now shows a "Storage Used" bar and allows deleting files to free up space.

3.  **Documentation**:
    -   Pricing page updated ("Instant Purge*", footnote, Bulk feature list).
    -   Terms page updated with limit details.
    -   README and knowledge base updated.

## Next Steps for You

### 1. Run Database Migration
✅ **DONE** - Executed via Supabase MCP.

### 2. Verify R2 Configuration
Ensure your R2 bucket CORS settings allow the new bulk download endpoint if you are streaming directly (though the current implementation streams through the API, so standard API CORS applies).

### 3. Test the Flow
1.  Log in as a Globber user.
2.  Drag 3-4 GLB files into the drop zone.
3.  Click "Start Optimization".
4.  Watch the sequential progress.
5.  Select files and test the "Download Selected" ZIP function.
6.  Go to History and check if the storage bar appears.
7.  Delete a file and verify the storage usage drops.

## Files Modified
- **Frontend:** `Index.tsx`, `DropZone.tsx`, `ComparisonViewer.tsx`, `History.tsx`, `Pricing.tsx`, `Terms.tsx`
- **New Components:** `FileQueue.tsx`, `BulkProgressList.tsx`, `BulkResultsTable.tsx`
- **Backend:** `optimizeController.ts`, `entitlementService.ts`, `dbService.ts`, `r2Service.ts`
- **Libs:** `api.ts` (added bulk methods)
