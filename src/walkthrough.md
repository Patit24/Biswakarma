# Walkthrough: Biswakarma Furniture Experience

We have built a world-class 2026 furniture brand website for **Biswakarma** that feels like an interactive cinematic experience using photorealistic interior and furniture photography.

## Core Accomplishments
1. **Photorealistic Backdrop Engine (`App.jsx`)**:
   - Replaced the simple 3D WebGL renderer with a high-performance **full-screen photographic backdrop engine**.
   - Curated 24 high-resolution, magazine-quality architecture and interior photography assets from Unsplash.
   - Built a dynamic **cinematic cross-fade** that transitions between images with zoom-parallax reveals (`scale-105` to `scale-100`) as you scroll.
   - Reduced production build asset size by over **500 KB** (from 858 KB to 315 KB) by tree-shaking WebGL code, resulting in instant load times.

2. **Interactive Perspectives Console**:
   - The HUD console at the bottom now operates as a **Camera Viewport Selector**.
   - Clicking **Frontal Hero**, **Zoom Details**, or **Room Layouts** dynamically swaps the active background photograph to show that exact perspective of the current product.
   - Integrated these angles across the entire portfolio (armchair, dining table, platform bed, office desk).

3. **Premium Cinematic Design System (`index.css` & `App.jsx`)**:
   - Palette: Matte Black, Walnut, Steel, and Warm Ivory.
   - Integrated `Cinzel` (Roman serif display) and `Josefin Sans` font pairings to establish architectural and editorial gravity.
   - Implemented layout hairlines: rendered vertical blueprint hairlines mapped at 15% and 85% of screen width.
   - Custom Cursor: added a custom magnetic dot cursor that tracks pointer movement smoothly.
   - Glassmorphic card patterns and neomorphic tactile controls.
   - Added a **Day / Night Theme Toggle** in the header. When clicked, it transitions the body background, typography, neomorphic buttons, and cards from a sleek matte-black night style to a warm ivory day style, adjusting image brightness accordingly.

4. **Multi-Image Card Layouts**:
   - Integrated matching photography inside layout bento grid cells, Sanctuaries, Actuated office workspace showcases, andComo Lake residency galleries to produce a fully complete, magazine-like client-ready design.

---

## Verification Results
- Ran a production build test via `npm run build` which compiled successfully with zero errors or warnings.
- Local development server is active at [http://localhost:5173/](http://localhost:5173/).
