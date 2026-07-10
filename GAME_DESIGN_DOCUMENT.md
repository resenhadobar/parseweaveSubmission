# Voxel Beach Block - Game Design Document

## Concept

**Voxel Beach Block** is a browser-playable 3D voxel diorama created for the Parsewave Game Jam 2026 requirements. The prototype presents a detailed oceanfront neighborhood block with a beach, animated ocean shader, Ocean Avenue road, beachfront buildings, props, cars, palm trees, and voxel people.

## Design Pillars

- **Polished voxel density:** many small block-built details instead of a sparse placeholder scene.
- **Beach-town identity:** sand, surf shop, lifeguard tower, umbrellas, towels, palm trees, beach houses, and ocean avenue.
- **Inspectable assets:** individual voxel structures can be isolated in a separate viewer.
- **Browser-first reliability:** Vite + TypeScript + Three.js with responsive canvas rendering.

## Core Loop

This is a showcase/exploration prototype rather than a score-based game.

1. Load into the full voxel beach block.
2. Orbit and zoom the camera to inspect the neighborhood.
3. Switch to the individual 3D viewer.
4. Cycle through standalone voxel assets such as houses, cars, people, palm trees, beach props, and the lifeguard tower.
5. Return to the full beach block.

## Player Goals

- Explore the full voxel beach neighborhood.
- Notice decorative details and polish across the beach, avenue, buildings, and props.
- Inspect individual asset construction in isolation.

## Controls

| Action | Input |
| --- | --- |
| Orbit camera | Drag mouse/touch |
| Zoom camera | Mouse wheel/trackpad |
| Open individual asset viewer | `V` |
| Return to beach block | `B` |
| Next asset | `]` or Right Arrow |
| Previous asset | `[` or Left Arrow |

## World and Theme

The scene is a sunny coastal neighborhood with:

- Animated ocean water and foam bands.
- Voxel sand beach with towels, umbrellas, shells, dunes, volleyball net, and lifeguard tower.
- Ocean Avenue with asphalt, lane markings, crosswalks, sidewalks, parked cars, benches, and streetlights.
- Beachfront homes, surf shop, apartment/hotel-style building, fences, and porches.
- Palm trees, decorations, people, and small environmental storytelling props.

## Visual Style

- Bright stylized voxel art.
- Clean block silhouettes with smaller decorative cubes for windows, signs, railings, awnings, wheels, lights, and props.
- Warm sun lighting, soft shadows, sky-blue fog, saturated beach palette.
- Ocean uses a custom animated shader for wave motion, shallow/deep color blending, foam lines, and shimmer.

## Technical Architecture

- `src/main.ts` boots the app.
- `src/app.ts` owns Three.js renderer, camera, scene switching, input, resize handling, and animation loop.
- `src/camera/orbitCamera.ts` contains the orbit camera controller.
- `src/viewer/assetViewer.ts` contains the standalone asset inspection mode.
- `src/voxel/` contains voxel block helpers, materials, procedural asset factories, the beach block scene, and ocean shader.

Rules:

- Keep source files modular and under 500 lines except documentation.
- Use source-managed TypeScript modules rather than hard-coded public asset paths.
- No extra UI elements beyond the requested inspection controls and lightweight instruction overlay.

## Scope

### Implemented

- Full 3D voxel beach block scene.
- Animated ocean shader.
- Ocean Avenue with road details and cars.
- Beach props, lifeguard tower, towels, umbrellas, volleyball net, palm trees, benches, people.
- Multiple buildings including beach houses and surf shop.
- Separate individual asset viewer.
- Responsive camera and canvas.

### Non-goals for this jam prototype

- Combat, economy, quests, or scoring.
- Save/load.
- Complex character AI.
- Physics-based driving or swimming.

## Parsewave Submission Notes

The game is browser-playable and should be deployed from the Vite `dist/` output. README disclosures should list the engine/framework, AI-assisted creation process, and any prior template usage.
