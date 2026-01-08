# GLOB DEBUG MENU SYSTEM

**Access**: Press `CTRL` + `Backtick (`)` or click the `DEBUG` button in the bottom-right corner.

## Core Features

### 1. Element Inspector (Pick Mode)
- Click **"PICK ELEMENT FROM PAGE"** to enter inspection mode.
- Hover over any element to highlight it (dashed pink outline).
- Click to select an element and open its properties.
- **ESC** to cancel pick mode.

### 2. Transform Controls (Photoshop-style)
- Selected elements display an overlay with resize handles.
- **Handles**:
  - **Bottom-Right (SE)**: Resize both width and height.
  - **Right (E)**: Resize width only.
  - **Bottom (S)**: Resize height only.
- **Drag**: Click and drag the element itself to move it (uses CSS transform).

### 3. State Management
- Force the application into specific states for testing:
  - `IDLE`: Initial upload state.
  - `PREVIEW`: 3D viewer active.
  - `PROCESSING`: Loading/compressing animation.
  - `COMPLETE`: Comparison view.

### 4. Property Editor
- **Position (x, y)**: Live updating as you drag.
- **Dimensions (w, h)**: Live updating as you resize.
- **Scale**: Adjust scale factor using `+` / `-` buttons.
- **Rotation**: Display only (derived from transform matrix).

### 5. CSS Generation
- Click **"COPY CSS"** to copy the exact `transform`, `width`, and `height` styles to your clipboard.
- Useful for tweaking layout in the browser and pasting back into code.

## Technical Details

- **Animations**: Uses "Lowkey" brutalist animations (Typewriter text, subtle flicker).
- **Library**: Powered by GSAP `Draggable` plugin.
- **Overlay**: Fixed position overlay synchronized with element scrolling/resizing.

## Quick Actions
- **Header Cat**: Selects the `glob.svg` logo.
- **Header Text**: Selects the "glob" title.
- **Drop Zone**: Selects the main file upload area.
