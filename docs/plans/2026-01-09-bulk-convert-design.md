# Bulk Convert & Storage Quota Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement queue-based bulk file conversion (max 10 files) for Premium (Globber) users, with a 1GB total storage quota, multi-file UI, and ZIP download functionality.

**Architecture:**
- **Frontend:** Upgrade `DropZone` for multi-file, add `FileQueue` for list management, `BulkProgressList` for processing status, and `BulkResultsTable` for outcomes. Reuse existing single-file `optimizeFile` API call sequentially.
- **Backend:** Add `x-bulk` header check for tier enforcement. Implement storage quota logic in Supabase `profiles` + `optimizeController`. Add endpoint to stream ZIP downloads from R2.
- **Data:** Track `storage_used_bytes` in Supabase. Store `userId` in metadata JSON for quota management on cleanup.

**Tech Stack:** React, Tailwind (UI), Express, Archiver (ZIP), Supabase (Quota), Cloudflare R2 (Storage).

## Phase 1: Documentation & Pricing Updates

### Task 1: Update Documentation & Copy
**Files:**
- Modify: `src/pages/Pricing.tsx`
- Modify: `src/pages/Terms.tsx`
- Modify: `README.md`
- Modify: `todo.md`
- Modify: `AGENTS.md`

**Step 1: Update Pricing Page**
- Locate `src/pages/Pricing.tsx`.
- Update Free card: Change "Instant Purge (Unless Shared)" to "Instant Purge*".
- Add footnote near bottom: `*Shared links last 1 hour`.
- Update Globber card: Add list item "Bulk Convert (up to 10 files)".

**Step 2: Update Terms Page**
- Locate `src/pages/Terms.tsx`.
- Add section about "Bulk Processing Limits" (10 files max).
- Add section about "Storage Quota" (1GB total for Globber).

**Step 3: Update README & todo.md**
- Add "Bulk Convert" to `todo.md` checklist.
- Document new bulk capabilities in `README.md`.
- Update `AGENTS.md` with new features.

**Step 4: Commit**
```bash
git add .
git commit -m "docs: update pricing and terms for bulk features"
```

## Phase 2: Frontend - DropZone & File Selection

### Task 2: Multi-file DropZone Support
**Files:**
- Modify: `src/components/DropZone.tsx`
- Modify: `src/pages/Index.tsx`

**Step 1: Update DropZone Props**
- Edit `src/components/DropZone.tsx`.
- Update interface: `onFileSelect: (files: File[]) => void`.
- Add prop: `maxFiles: number` (default 1).
- Update input `multiple` attribute based on `maxFiles > 1`.

**Step 2: Handle Multiple Files**
- In `handleDrop` and `handleFileChange`:
  - Collect all files.
  - If `files.length > maxFiles`, slice or warn.
  - Return array to `onFileSelect`.
- Keep animation logic working (trigger on drop).

**Step 3: Update Index.tsx State**
- Edit `src/pages/Index.tsx`.
- Change `file` state to `files` state (`File[]`).
- Update `handleFileSelect` to accept array.
- Add logic: if `!isPremium && files.length > 1`, show toast "Bulk is for Globbers only" and take only first file.

**Step 4: Commit**
```bash
git add src/components/DropZone.tsx src/pages/Index.tsx
git commit -m "feat(ui): enable multi-file dropzone support"
```

### Task 3: FileQueue Component
**Files:**
- Create: `src/components/FileQueue.tsx`
- Modify: `src/pages/Index.tsx`

**Step 1: Create FileQueue UI**
- Create `src/components/FileQueue.tsx`.
- Props: `files: File[]`, `onRemove: (index: number) => void`, `onClear: () => void`, `onStart: () => void`.
- Render list of files (name, size).
- Add "Start Optimization" button.

**Step 2: Integrate into Index.tsx**
- In `src/pages/Index.tsx`, if `files.length > 0 && appState === 'idle'`, show `FileQueue` instead of `DropZone`.
- Implement remove/clear handlers.

**Step 3: Commit**
```bash
git add src/components/FileQueue.tsx src/pages/Index.tsx
git commit -m "feat(ui): add file queue component"
```

## Phase 3: Frontend - Bulk Processing

### Task 4: BulkProgressList Component
**Files:**
- Create: `src/components/BulkProgressList.tsx`
- Modify: `src/pages/Index.tsx`

**Step 1: Create Component**
- Create `src/components/BulkProgressList.tsx`.
- Props: `files: File[]`, `status: FileStatus[]` (pending, processing, complete, error), `currentProgress: number`.
- Render vertical list with icons and progress bar for active file.

**Step 2: Sequential Processing Logic**
- In `src/pages/Index.tsx`, update `handleCompress`:
  - Iterate through `files`.
  - Update `processingIndex` state.
  - Call `optimizeFile` for each.
  - Accumulate results in `results` state.
  - Handle errors (mark file as failed, continue to next).

**Step 3: Commit**
```bash
git add src/components/BulkProgressList.tsx src/pages/Index.tsx
git commit -m "feat(ui): implement bulk processing logic"
```

## Phase 4: Backend - Quota & Bulk Support

### Task 5: Database Quota Tracking
**Files:**
- Modify: `api/src/services/dbService.ts`
- Modify: `api/src/services/entitlementService.ts`
- Modify: `api/src/controllers/optimizeController.ts`

**Step 1: Update Entitlement Service**
- Add `getStorageUsage(userId)` to `entitlementService.ts`.
- Mock Supabase column `storage_used_bytes` (assuming we can't migrate DB schema directly, we'll check `profiles` metadata or assume it exists/mock it for now. **Note:** Since I can't run SQL migrations on your Supabase instance, I'll add the logic assuming the column exists, or store it in `profiles.metadata`).
  - *Correction:* I will assume `profiles` table has `storage_used_bytes`. If not, I will add a migration file for you to run.

**Step 2: Add Migration File**
- Create `api/supabase/migrations/20260109_add_storage_quota.sql`.
- SQL: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;`

**Step 3: Implement Quota Check**
- In `optimizeController.ts` POST `/optimize`:
  - Call `getStorageUsage`.
  - If `usage + fileSize > 1GB`, return 413.

**Step 4: Update Quota on Save**
- In `dbService.ts` `saveOptimization`:
  - Increment `storage_used_bytes` for user.

**Step 5: Commit**
```bash
git add api/src/services/dbService.ts api/src/services/entitlementService.ts api/src/controllers/optimizeController.ts
git commit -m "feat(api): implement storage quota logic"
```

### Task 6: ZIP Download Endpoint
**Files:**
- Modify: `api/src/server.ts`
- Modify: `api/src/controllers/optimizeController.ts`
- Modify: `api/src/services/r2Service.ts`

**Step 1: R2 Stream Support**
- In `r2Service.ts`, add `getFileStream(key)` returning `Readable`.

**Step 2: Create Endpoint**
- In `optimizeController.ts`, add `POST /download/zip`.
- Body: `{ fileIds: string[] }`.
- Validate IDs.
- Use `archiver` to create ZIP stream.
- Append files from R2 streams.
- Pipe to response.

**Step 3: Install Archiver**
```bash
cd api && npm install archiver && npm install --save-dev @types/archiver
```

**Step 4: Commit**
```bash
git add api/src/controllers/optimizeController.ts api/src/services/r2Service.ts
git commit -m "feat(api): add zip download endpoint"
```

## Phase 5: Frontend - Results & Viewer

### Task 7: BulkResultsTable Component
**Files:**
- Create: `src/components/BulkResultsTable.tsx`
- Modify: `src/pages/Index.tsx`
- Modify: `src/lib/api.ts`

**Step 1: Create Table UI**
- Render table of results: Name, Original, Optimized, %, Status.
- Add checkboxes + Select All.
- Add "Download Selected" button (calls `downloadBulkZip` from api.ts).

**Step 2: Add Bulk API Method**
- In `src/lib/api.ts`, add `downloadBulkZip(fileIds)`.

**Step 3: Integrate into Index**
- Show table when `appState === 'complete'` and `files.length > 1`.

**Step 4: Commit**
```bash
git add src/components/BulkResultsTable.tsx src/pages/Index.tsx src/lib/api.ts
git commit -m "feat(ui): add bulk results table and zip download"
```

### Task 8: Comparison Viewer Enhancements
**Files:**
- Modify: `src/components/ComparisonViewer.tsx`
- Modify: `src/pages/Index.tsx`

**Step 1: Add File Switcher**
- In `ComparisonViewer`, add header with Prev/Next buttons and Dropdown (if multiple files).
- Add `onNext`, `onPrev`, `onSelectFile` props.

**Step 2: Connect to Index**
- In `Index.tsx`, manage `viewingIndex` state.
- Pass correct file data to viewer based on index.

**Step 3: Commit**
```bash
git add src/components/ComparisonViewer.tsx src/pages/Index.tsx
git commit -m "feat(ui): add file switcher to comparison viewer"
```

## Phase 6: Storage Management UI

### Task 9: History & Delete
**Files:**
- Modify: `src/components/History.tsx`
- Modify: `api/src/controllers/optimizeController.ts`

**Step 1: Add Delete Endpoint**
- In `optimizeController.ts`, `DELETE /history/:id`.
- Delete from R2, DB, decrement quota.

**Step 2: Update History UI**
- Add trash icon button to history items.
- Add "Storage Used" progress bar at top of history.

**Step 3: Commit**
```bash
git add src/components/History.tsx api/src/controllers/optimizeController.ts
git commit -m "feat(ui): add delete and storage usage to history"
```

## Final Verification

**Step 1: Full Flow Test**
- Drag 3 files.
- Verify queue shows 3 files.
- Click Start.
- Verify progress list updates sequentially.
- Verify results table shows 3 successes.
- Select 2, download ZIP.
- Click one, verify switcher works in viewer.
- Check History, verify storage quota increased.
- Delete one, verify quota decreased.
