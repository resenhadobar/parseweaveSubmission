# Voxel Beach Block

A browser-playable 3D voxel beach neighborhood prototype built with Vite, TypeScript, and Three.js.

## AI tools used

This game was entirely built with AI using Jabali Studio (jabali.ai), music, sounds, assets (proceduraly generated threeJS geometry) were all built using GPT 5.5 within the Studio.

## Overview

Voxel Beach Block is now a GTA-style over-the-shoulder voxel skate delivery game prototype set in a polished oceanfront neighborhood. Players start with a tutorial modal, toggle skate mode, kickflip, dodge traffic/obstacles, stop at green sidewalk NPC delivery offers, then follow a red Crazy Taxi-style 3D arrow and red ground aura to the dropoff before time runs out. Fast deliveries pay more cash, kickflips during active runs add RAD bonus value, and the scene includes a seamless procedural beach sky dome, music, ocean ambience, ride wind, animated ocean shader, Ocean Avenue, dense neighborhood blocks, animated cars, walking pedestrians, swaying palm/tropical trees, lifeguard towers, beach props, and mountain perimeter scenery.

It also includes a separate individual 3D asset viewer so each voxel structure can be inspected outside the full neighborhood scene.

## How to Play / Inspect

| Action                       | Input                                       |
| ---------------------------- | ------------------------------------------- |
| Move camera-relative         | `WASD` or Arrow Keys                        |
| Toggle skate mode            | `E`                                         |
| Kickflip while skating       | `Space`                                     |
| Camera                       | Automatically stays behind the player/rider |
| Open individual asset viewer | `V`                                         |
| Return to beach block        | `B`                                         |
| Next asset                   | `]` or Right Arrow                          |
| Previous asset               | `[` or Left Arrow                           |

## Features

- Detailed voxel beach block scene.
- Animated ocean shader with waves, foam bands, shallow/deep water blending, and shimmer.
- Ocean Avenue with road markings, sidewalks, crosswalks, streetlights, cars, and benches.
- Beach decorations including towels, umbrellas, dunes, shells, volleyball net, and lifeguard tower.
- Beachfront and inland buildings reworked around `assets/voxelBeachSkill.txt` and `assets/buildingReference.png`, using stronger silhouettes, traditional Malibu-inspired layered low-pitch roofs, porches, balconies, awnings, storefronts, rooftop details, and cohesive beach-town palettes.
- Voxel people scaled so buildings read as walkable interiors compared to cars and doors.
- Unplayable surrounding scenery with 2x-height rock-dominant Rio-style horseshoe mountains, outer terrain, tree line, and perimeter border.
- 60fps-oriented rendering optimizations using instanced mountain/outer-ground voxel batches, reduced pixel ratio cap, and lower shadow-map budget.
- Animated player/skater character, skateboard, voxel pedestrians, and cars, varied palm/tropical trees, surf racks, bicycles, food cart, beach shower, tiny boat, and other props.
- Green in-world arrows and minimap dots mark NPC delivery offers; stopping near one starts a timed delivery with a red dropoff dot and top-center 3D Crazy Taxi-style direction arrow.
- Quest NPCs are placed on deterministic randomized sidewalk positions so offers do not spawn inside buildings.
- Cash counter and delivery timer track delivery earnings and remaining time; faster deliveries pay more and active-run kickflips show RAD! feedback while increasing delivery value.
- Active dropoffs show a red GTA-style ground aura at the destination.
- Skate crashes against cars, pedestrians, houses, trees, or props trigger a bail animation and time penalty.
- Seamless procedural beach sky dome, coastal music loop, ocean surf loop, and speed-reactive wind loop add atmosphere.
- Player collision against buildings, trees, towers, umbrellas, benches, and major beach props.
- Fewer signal-timed cars that recycle through tunnel routes instead of forming permanent jams.
- Camera-frustum visibility culling so static scene sections outside the camera view are hidden from rendering.
- Separate 3D asset inspection mode.
- Responsive full-window browser canvas.

## Development Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

- `npm run dev` starts the local preview server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run typecheck` validates TypeScript.

## Tech Stack

- Vite
- TypeScript
- Three.js
- Procedural voxel geometry built from Three.js box meshes, with ground and perimeter batches where density is highest
- Custom GLSL shader material for ocean animation

## Project Structure

- `src/main.ts` - app entry point.
- `src/app.ts` - renderer, scene, camera, resize, input, and animation loop.
- `src/camera/overShoulderCamera.ts` - automatic GTA-style over-the-shoulder follow camera.
- `src/camera/orbitCamera.ts` - legacy orbit/zoom camera controls retained for reference.
- `src/viewer/assetViewer.ts` - individual voxel asset viewer.
- `src/voxel/blocks.ts` - reusable voxel block helpers, including instanced voxel batching for dense scenery.
- `src/voxel/materials.ts` - voxel color palette and materials.
- `src/voxel/assets.ts` - procedural voxel asset factories.
- `src/voxel/scenery.ts` - unplayable outer terrain, mountains, tree line, and playable border.
- `src/voxel/scene.ts` - full beach block composition.
- `src/voxel/traffic.ts` - deterministic moving cars and sidewalk pedestrian loops.
- `src/player/playerController.ts` - camera-follow walking, skate mode, push movement, kickflips, bails, and collision-aware skating.
- `src/delivery/deliveryController.ts` - green pickup offers, red dropoff arrow, timers, payouts, and crash penalties.
- `src/delivery/deliveryHud.ts` - tutorial modal, delivery minimap, timer, cash counter, RAD text, and screen-space 3D destination arrow.
- `src/delivery/scoring.ts` - delivery payout scoring helper.
- `src/audio/beachAudio.ts` - music, ocean ambience, and speed-reactive ride wind loop playback.
- `src/render/skyDome.ts` - seamless procedural beach sky dome.
- `src/voxel/palmWind.ts` - shared palm-tree wind sway registry and animation update.
- `src/player/collisions.ts` - lightweight player collision bounds for buildings and props.
- `src/render/visibilityCulling.ts` - camera-frustum culling for static scene sections.
- `src/voxel/characterAnimation.ts` - shared voxel character walk-cycle animation.
- `src/voxel/ocean.ts` - animated ocean shader.
- `tests/voxelLayout.test.ts` - layout, road, scale, and perimeter validation tests.
- `GAME_DESIGN_DOCUMENT.md` - living design document.
- `uploads/parseweave_jam_requirements.txt` - supplied Parsewave Game Jam requirements reference.

## Parsewave Game Jam 2026 Submission Checklist

This repository is structured for the Parsewave Game Jam 2026 requirements:

| Requirement                                         | Status                      | Notes                                                                                                                                                |
| --------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployed browser-playable game URL                  | Pending deployment          | Build with `npm run build`, then deploy the generated `dist/` output.                                                                                |
| Public source code repository                       | Ready to publish            | Source lives in `src/`, tests in `tests/`, docs in `README.md` and `GAME_DESIGN_DOCUMENT.md`. Do not publish `node_modules/`.                        |
| README with game explanation and controls           | Done                        | See Overview, How to Play, Features, Tech Stack, and Project Structure.                                                                              |
| README states what was built during the jam window  | Documented below            | See “Built During the Jam Window.”                                                                                                                   |
| README discloses AI tools and workflow              | Documented below            | See “AI Tools and Workflow Disclosure.”                                                                                                              |
| README credits prior work/external resources        | Documented below            | See “Prior Work / External Resources.”                                                                                                               |
| AI-agent traces/chats/prompts/logs/tool outputs zip | Must be exported separately | Submit one zip of Jabali chat/tool traces and any supporting AI logs; this repo references the requirement but does not contain the final trace zip. |

## Built During the Jam Window

The intended jam-window contribution is the playable voxel skate-delivery prototype and its polish pass, including:

- Procedural voxel beach neighborhood scene, roads, sidewalks, beach props, buildings, cars, people, palm trees, and perimeter scenery.
- Over-the-shoulder player controller with skateboard toggle, steering, kickflips, bails, and collision handling.
- Delivery system with sidewalk NPC pickups, randomized dropoffs, red destination aura, 3D direction arrow, timer, cash payouts, and RAD kickflip bonuses.
- Minimap, cash counter, delivery timer, startup tutorial modal, audio loops, procedural sky dome, ocean shader, traffic/pedestrian animation, and palm wind sway.
- Documentation, validation scripts, and project structure updates for public jam submission.

If any of this work started before the official 24-hour build window, that prior work must be called out explicitly before submission.

## Deployment Notes

Recommended submission flow:

1. Run `npm install` if dependencies are not installed.
2. Run `npm run build`.
3. Deploy the generated `dist/` folder to a static web host.
4. Publish the source repository publicly without `node_modules/` or local-only generated caches.
5. Export Jabali Studio AI-agent traces/chats/tool outputs as a separate zip and attach it to the jam submission.

## AI Tools and Workflow Disclosure

Built with AI assistance inside Jabali Studio. AI assistance was used for:

- Interpreting the requested voxel beach neighborhood direction.
- Reading the supplied Parsewave jam requirements.
- Designing the prototype scope and controls.
- Generating modular TypeScript/Three.js implementation files.
- Creating procedural voxel assets and shader code.
- Generating the beach music, ocean ambience, ride wind sound effects, and earlier skybox experiment.
- Updating documentation for jam-readiness.

## Prior Work / External Resources

- Started from the Jabali Vite/TypeScript web base template.
- Uses the open-source Three.js library through npm.
- Uses Vite, TypeScript, Vitest, oxlint, and oxfmt npm packages listed in `package.json`.
- `assets/voxelBeachSkill.txt` and `assets/buildingReference.png` are local creative references for the latest architecture and beach personality pass; the runtime scene remains procedurally built from code.
- `assets/conceptArt.png` is a local concept reference for the scenic voxel beach-block direction.
- Generated audio assets are stored under `src/assets/audio/` and should be disclosed as AI-generated audio assets.
