# Debug Menu Specification

Reusable debug menu for React applications. Brutalist aesthetic, GSAP-powered, developer-focused.

## Core Features

### 1. Phase/State Switcher
- Display all possible app states as clickable buttons
- Current state highlighted with accent color
- Instantly switch between states for testing UI in different phases
- Auto-create mock data when switching (mock file for states that need one)
- Show current state in text below buttons

### 2. Element Picker (Click-to-Select)
- **PICK ELEMENT FROM PAGE** button enables pick mode
- Cursor changes to crosshair
- Semi-transparent overlay appears
- Click any element to make it draggable
- Auto-generates CSS selector for the element
- ESC to cancel pick mode
- Selected elements get dashed outline

### 3. Element Manipulator
- Make any DOM element draggable via CSS selector
- Preset buttons for common elements (header, logo, main components)
- Custom selector input field (press Enter to activate)
- Uses GSAP Draggable plugin for smooth interaction

### 4. Size Controls
- **WIDTH**: Number input to change element width in pixels
- **HEIGHT**: Number input to change element height in pixels  
- **SCALE**: +/- buttons to scale element (0.1 increments)
- All changes update live readout

### 5. Position/Size Readout
- Live display of selected element's properties:
  - x, y position (from transform matrix)
  - width, height (in pixels)
  - scale factor
  - rotation angle
- Updates in real-time during drag
- "Copy CSS" button generates ready-to-paste styles

### 6. Element History
- Track all elements that have been made draggable
- Click to re-select and view properties
- Shows count of tracked elements
- Scrollable list with truncated selectors

## Visual Design

### Layout
```
┌─────────────────────────────────┐
│ DEBUG_MENU                 [X]  │
├─────────────────────────────────┤
│ APP_STATE                       │
│ [IDLE] [LOADING] [PREVIEW]      │
│ [PROCESSING] [COMPLETE]         │
│ current: idle                   │
├─────────────────────────────────┤
│ MAKE_DRAGGABLE                  │
│ [■ PICK ELEMENT FROM PAGE ■]    │ <- Primary action
│ [Header Cat (glob.svg)]         │
│ [Header Text]                   │
│ [Drop Zone]                     │
│ [________________] <- selector  │
├─────────────────────────────────┤
│ SELECTED: header img            │
│ ┌─────────┬─────────┐           │
│ │x: 12px  │w: 66px  │           │
│ │y: -15px │h: 52px  │           │
│ │rot: 0°  │scale:1.0│           │
│ └─────────┴─────────┘           │
│ WIDTH  [____66____] px          │
│ HEIGHT [____52____] px          │
│ SCALE  [-] 1.00x [+]            │
│ [      COPY CSS        ]        │
├─────────────────────────────────┤
│ ALL_ELEMENTS (3)                │
│ ┌─────────────────────────────┐ │
│ │ header img                  │ │
│ │ (12, -15) 66x52             │ │
│ ├─────────────────────────────┤ │
│ │ header h1                   │ │
│ │ (-10, -17) 40x24            │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ CTRL+` to toggle                │
└─────────────────────────────────┘
```

### Pick Mode Overlay
```
┌─────────────────────────────────────────┐
│                                         │
│     ┌───────────────────────────┐       │
│     │ CLICK AN ELEMENT TO SELECT│       │
│     │ Press ESC to cancel       │       │
│     └───────────────────────────┘       │
│                                         │
│  [cursor: crosshair everywhere]         │
│                                         │
└─────────────────────────────────────────┘
```

### Styling Rules
- Fixed position: top-right corner
- Width: 320px
- Max height: 90vh with overflow scroll
- Background: dark surface color
- Border: 3px solid muted color
- Font: monospace/UI font, uppercase labels
- No border-radius (brutalist)
- No transitions on buttons (instant feedback)
- Accent color (#FC6E83) for active/selected states
- Selected elements get dashed outline in accent color

## Implementation

### Dependencies
```bash
npm install gsap
```

### GSAP Plugin Registration
```typescript
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
gsap.registerPlugin(Draggable);
```

### Component Props
```typescript
interface DebugMenuProps {
  appState: YourAppState;
  onStateChange: (state: YourAppState) => void;
}
```

### Key Behaviors

1. **Toggle visibility**
   - Small "DEBUG" button in corner when closed
   - Full panel when open
   - Keyboard shortcut: Ctrl+` (backtick)

2. **Pick mode**
   - Click handler on document (capture phase)
   - Ignore clicks on debug panel itself
   - Generate selector from element (id > class > tag path)
   - Exit on ESC or successful pick

3. **Draggable activation**
   - Set `position: relative` on target element
   - Add dashed outline for visibility
   - Store element reference with data attribute
   - Create GSAP Draggable instance
   - Update readout on drag/dragEnd

4. **Size manipulation**
   - Direct width/height style changes
   - Scale via GSAP transform
   - Re-read element info after changes

5. **Transform extraction**
   - Use `DOMMatrix` to parse computed transform
   - Extract translation from m41, m42
   - Extract scale from sqrt(a² + b²)
   - Extract rotation from atan2(m21, m11)

6. **Copy to clipboard**
   ```css
   transform: translate(Xpx, Ypx) scale(S);
   width: Wpx;
   height: Hpx;
   ```

### State Handler in Parent
```typescript
const createMockFile = () => {
  const content = new Blob(['mock'], { type: 'model/gltf-binary' });
  return new File([content], 'debug.glb', { type: 'model/gltf-binary' });
};

const handleDebugStateChange = (newState: AppState) => {
  // Create mock data for states that need it
  if (newState !== 'idle' && !file) {
    setFile(createMockFile());
  }
  setAppState(newState);
  // Set appropriate mock values per state
};
```

### Animation
- Panel open: fade in + slide from right (0.3s, power2.out)
- Use GSAP for all animations

## Usage Prompt

> Add a debug menu to this React app. It should:
> - Let me switch between app states/phases instantly (with mock data)
> - Have a "Pick Element" mode where I click any element to select it
> - Make selected elements draggable with GSAP
> - Show x, y, width, height, scale values in real-time
> - Let me change width, height, and scale with inputs/buttons
> - Copy the CSS transform values to clipboard
> - Track all manipulated elements in a list
> - Toggle with Ctrl+` or a small button
> - Match brutalist style (dark, no rounded corners, accent color #FC6E83)
> - Use GSAP for animations and Draggable functionality

## Removal for Production

Either:
1. Wrap in `process.env.NODE_ENV === 'development'` check
2. Use dynamic import with lazy loading
3. Remove component entirely before deploy
