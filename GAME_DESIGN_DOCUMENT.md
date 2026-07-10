# Voxel Beach Block - Game Design Document

## Concept

**Voxel Beach Block** is a browser-playable 3D voxel diorama created for the Parsewave Game Jam 2026 requirements. The prototype presents a contained playable oceanfront neighborhood with a beach, improved ocean shader, Ocean Avenue, internal streets, visible borders, denser mixed housing blocks, props, cars, palm trees, and realistically scaled voxel people. The playable block is surrounded by an unplayable scenic perimeter with voxel mountains and trees inspired by `assets/conceptArt.png`.

## Design Pillars

- **Polished voxel density:** many small block-built details instead of a sparse placeholder scene.
- **Beach-town identity:** sand, surf shop, lifeguard tower, umbrellas, towels, palm trees, beach houses, and ocean avenue.
- **Readable scale:** people, cars, doors, story heights, and buildings should imply that characters could walk inside buildings.
- **Contained playable area:** the neighborhood is the active inspectable/playable area, with mountains and trees used as non-playable surrounding scenery.
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

- Animated ocean water and foam bands placed beyond the beach edge so it does not sink through or cover sand tiles.
- Voxel sand beach with towels, umbrellas, shells, dunes, volleyball net, and lifeguard tower.
- Ocean Avenue with asphalt, lane markings, crosswalks, sidewalks, parked cars, benches, and streetlights.
- A larger contained neighborhood grid with visible perimeter borders and multiple internal streets.
- Beachfront homes, surf shop, added cottages, smaller apartment clusters, fences, and porches.
- An unplayable outer perimeter with voxel mountains, terrain, pines, palms, and border fencing to frame the playable area.
- Palm trees, decorations, people, and small environmental storytelling props.

## Visual Style

- Bright stylized voxel art.
- Clean block silhouettes with smaller decorative cubes for windows, signs, railings, awnings, wheels, lights, and props.
- Concept art reference: `assets/conceptArt.png`; current direction prioritizes a scenic, toy-like voxel block with mountains and dense neighborhood structures.
- Warm sun lighting, soft shadows, sky-blue fog, saturated beach palette.
- Ocean uses a custom animated shader for shallow/deep color blending, foam bands, ripples, and shimmer while remaining outside the sand footprint.

## Technical Architecture

- `src/main.ts` boots the app.
- `src/app.ts` owns Three.js renderer, camera, scene switching, input, resize handling, and animation loop.
- `src/camera/orbitCamera.ts` contains the orbit camera controller.
- `src/viewer/assetViewer.ts` contains the standalone asset inspection mode.
- `src/voxel/` contains voxel block helpers, materials, layout data, procedural asset factories, perimeter scenery, the beach block scene, and ocean shader.
- `tests/voxelLayout.test.ts` validates road/lot placement, vehicle lanes, scale ratios, and the surrounding scenery bounds.

Rules:

- Keep source files modular and under 500 lines except documentation.
- Use source-managed TypeScript modules rather than hard-coded public asset paths.
- No extra UI elements beyond the requested inspection controls and lightweight instruction overlay.

## Scope

### Implemented

- Full 3D voxel beach block scene.
- Improved animated ocean shader positioned beyond the sand line.
- Larger contained neighborhood with Ocean Avenue, internal streets, visible borders, road details, and cars.
- Beach props, lifeguard tower, towels, umbrellas, volleyball net, palm trees, benches, people.
- Multiple grounded buildings including beach houses, cottages, surf shop, smaller multi-building apartment blocks, and back-block buildings with roofs attached to walls.
- Reduced voxel person size and increased building story height so characters read correctly beside cars, doors, and buildings.
- Unplayable mountain/tree perimeter surrounding the playable block.
- Separate individual asset viewer.
- Responsive camera and canvas.

### Non-goals for this jam prototype

- Combat, economy, quests, or scoring.
- Save/load.
- Complex character AI.
- Physics-based driving or swimming.

## Parsewave Submission Notes

The game is browser-playable and should be deployed from the Vite `dist/` output. README disclosures should list the engine/framework, AI-assisted creation process, and any prior template usage.
