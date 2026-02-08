# Map Components Organization Plan

## Files to Create/Update:

### 1. Add missing types
- Add `GroupDrawerProps` interface to `src/types/database.ts`

### 2. Create map folder structure
- `src/components/map/` directory

### 3. Create component files (need contents from user):
- `Map.module.css`
- `GroupDrawer.tsx` ✅ (content provided)
- `ProfileDrawer.tsx` (need content)
- `MapHeader.tsx` (need content)
- `MapToggleTabs.tsx` (need content)
- `MapControls.tsx` (need content)
- `PulseBanner.tsx` (need content)
- `VisibleProfilesBar.tsx` (need content)

### 4. Create index files:
- `src/components/map/index.ts` (export all map components)
- Update `src/components/index.ts` to export map components


## Status: 
- [x] Analyzed existing structure
- [x] Collected all file contents from user
- [x] Create map folder structure
- [ ] Fix import paths in components
- [ ] Add missing types to database.ts
- [ ] Create all component files with corrected imports
- [ ] Update main components/index.ts exports
