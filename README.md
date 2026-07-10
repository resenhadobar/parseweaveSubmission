# Voxel Beach Block

A browser-playable 3D voxel beach neighborhood prototype built with Vite, TypeScript, and Three.js.

## Overview

Voxel Beach Block presents a polished oceanfront diorama with a proper voxel beach, animated ocean shader, Ocean Avenue, beachfront houses, surf shop, cars, people, palm trees, lifeguard tower, umbrellas, towels, benches, signs, streetlights, and decorations.

It also includes a separate individual 3D asset viewer so each voxel structure can be inspected outside the full neighborhood scene.

## How to Play / Inspect

| Action | Input |
| --- | --- |
| Orbit camera | Drag mouse/touch |
| Zoom camera | Mouse wheel/trackpad |
| Open individual asset viewer | `V` |
| Return to beach block | `B` |
| Next asset | `]` or Right Arrow |
| Previous asset | `[` or Left Arrow |

## Features

- Detailed voxel beach block scene.
- Animated ocean shader with waves, foam bands, shallow/deep water blending, and shimmer.
- Ocean Avenue with road markings, sidewalks, crosswalks, streetlights, cars, and benches.
- Beach decorations including towels, umbrellas, dunes, shells, volleyball net, and lifeguard tower.
- Beachfront buildings including pastel houses and surf shop.
- Voxel people, palm trees, vehicles, and props.
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
- Procedural voxel geometry built from Three.js box meshes
- Custom GLSL shader material for ocean animation

## Project Structure

- `src/main.ts` - app entry point.
- `src/app.ts` - renderer, scene, camera, resize, input, and animation loop.
- `src/camera/orbitCamera.ts` - orbit/zoom camera controls.
- `src/viewer/assetViewer.ts` - individual voxel asset viewer.
- `src/voxel/blocks.ts` - reusable voxel block helpers.
- `src/voxel/materials.ts` - voxel color palette and materials.
- `src/voxel/assets.ts` - procedural voxel asset factories.
- `src/voxel/scene.ts` - full beach block composition.
- `src/voxel/ocean.ts` - animated ocean shader.
- `GAME_DESIGN_DOCUMENT.md` - living design document.
- `uploads/parseweave_jam_requirements.txt` - supplied Parsewave Game Jam requirements reference.

## Parsewave Game Jam Notes

This project is structured for the Parsewave Game Jam 2026 requirements:

- Browser-playable web game/prototype.
- Source code can be published publicly.
- README documents controls, tech stack, scope, and disclosures.
- AI-agent traces/chats/tool outputs should be exported separately as required by the jam submission.

## AI Tools and Workflow Disclosure

Built with AI assistance inside Jabali Studio. AI assistance was used for:

- Interpreting the requested voxel beach neighborhood direction.
- Reading the supplied Parsewave jam requirements.
- Designing the prototype scope and controls.
- Generating modular TypeScript/Three.js implementation files.
- Creating procedural voxel assets and shader code.
- Updating documentation for jam-readiness.

## Prior Work / External Resources

- Started from the Jabali Vite/TypeScript web base template.
- Uses the open-source Three.js library through npm.
- No external art assets are currently required; the scene is procedurally built from code.
