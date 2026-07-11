# Voxel Beach Block - Game Design Document

## Concept

**Voxel Beach Block** is a browser-playable 3D voxel diorama created for the Parsewave Game Jam 2026 requirements. The prototype presents a contained walkable oceanfront neighborhood with a beach, improved ocean shader, Ocean Avenue, internal streets, visible borders, denser mixed housing blocks, personality-rich props, animated cars, varied trees, walking voxel people, and a controllable player character. The playable block is surrounded by an unplayable scenic perimeter with voxel mountains and trees inspired by `assets/conceptArt.png`.

## Design Pillars

- **Polished voxel density:** layered silhouettes and purposeful props instead of sparse placeholder boxes or noisy tiny detail.
- **Beach-town identity:** sand, surf shop, lifeguard tower, umbrellas, towels, palm trees, beach houses, and ocean avenue.
- **Readable scale:** people, cars, doors, story heights, and buildings should imply that characters could walk inside buildings.
- **Responsive exploration:** player movement should feel solid, with collisions preventing walking through major buildings and props.
- **Contained playable area:** the neighborhood is the active inspectable/playable area, with mountains and trees used as non-playable surrounding scenery.
- **Inspectable assets:** individual voxel structures can be isolated in a separate viewer.
- **Browser-first reliability:** Vite + TypeScript + Three.js with responsive canvas rendering.

## Core Loop

This is a showcase/exploration prototype rather than a score-based game.

1. Load into the full voxel beach block.
2. Walk the player character isometrically through the neighborhood while the camera follows.
3. Orbit and zoom the camera to inspect the neighborhood.
4. Switch to the individual 3D viewer.
5. Cycle through standalone voxel assets such as houses, cars, people, palm trees, beach props, and the lifeguard tower.
6. Return to the full beach block.

## Player Goals

- Explore the full voxel beach neighborhood.
- Notice decorative details and polish across the beach, avenue, buildings, and props.
- Inspect individual asset construction in isolation.

## Controls

| Action | Input |
| --- | --- |
| Walk player isometrically | `WASD` or Arrow Keys |
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
- Beachfront homes, surf shop, added cottages, smaller apartment clusters, fences, porches, balconies, rooftop terraces, awnings, planters, street-facing identity details, and Malibu-inspired low layered rooflines.
- An unplayable outer perimeter with tall rock-dominant Rio-style horseshoe mountains, sparse green patches, terrain, pines, palms, and border fencing to frame the playable area.
- Palm trees, decorations, people, and small environmental storytelling props.

## Visual Style

- Bright stylized voxel art.
- Clean block silhouettes with smaller decorative cubes for windows, signs, railings, awnings, wheels, lights, and props.
- Architecture references: `assets/voxelBeachSkill.txt` and `assets/buildingReference.png`; current building direction favors memorable silhouettes, traditional Malibu-style low layered roofs with broad eaves, porches, balconies, storefronts, rooftop props, cohesive palettes, and clear building purpose.
- Concept art reference: `assets/conceptArt.png`; current direction prioritizes a scenic, toy-like voxel block with mountains and dense neighborhood structures.
- Warm sun lighting, soft shadows, sky-blue fog, saturated beach palette.
- Ocean uses a custom animated shader for shallow/deep color blending, foam bands, ripples, and shimmer while remaining outside the sand footprint.

## Technical Architecture

- `src/main.ts` boots the app.
- `src/app.ts` owns Three.js renderer, camera, scene switching, input, resize handling, and animation loop.
- `src/camera/orbitCamera.ts` contains the orbit camera controller.
- `src/viewer/assetViewer.ts` contains the standalone asset inspection mode.
- `src/player/playerController.ts` contains isometric player walking and camera-follow target behavior.
- `src/player/collisions.ts` contains lightweight player collision bounds for buildings, trees, towers, umbrellas, benches, and major props.
- `src/render/visibilityCulling.ts` contains camera-frustum visibility culling for static world sections.
- `src/voxel/` contains voxel block helpers, instanced voxel batching, materials, layout data, procedural asset factories, perimeter scenery, shared character animation, traffic, the beach block scene, and ocean shader.
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
- Performance optimization pass for the tall mountain perimeter using instanced mountain/ground batches, coarser mountain sampling, reduced pixel ratio cap, and lower shadow-map budget to target 60fps.
- Latest architecture pass reworked beach houses, surf shop, apartments/hotels, palm trees, tropical trees, and beach props for stronger personality while batching the dense playable ground tiles for performance.
- Latest street-life pass adds deterministic animated cars on separated road routes with a preferential flow car to avoid permanent gridlock, walking pedestrians on sidewalk loops, denser planting in empty green lawn areas, tunnel portals at side/far mountain exits, and shared voxel walk cycles.
- Isometric player walking with WASD/arrow keys, camera follow, and player walk animation.
- Player collision resolution against buildings and major props.
- Simplified fewer-car traffic with signal timing and tunnel recycling so cars do not permanently jam.
- Camera-frustum culling of static scene sections outside the current camera view.
- Separate individual asset viewer.
- Responsive camera and canvas.

### Non-goals for this jam prototype

- Combat, economy, quests, or scoring.
- Save/load.
- Complex character AI.
- Physics-based driving or swimming.

## Parsewave Submission Notes

The game is browser-playable and should be deployed from the Vite `dist/` output. README disclosures should list the engine/framework, AI-assisted creation process, and any prior template usage.
