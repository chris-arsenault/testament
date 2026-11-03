# Modeling and geometry pass — 2026-11-02

The visual pass replaces the most obvious stacked primitives with authored procedural meshes. The visual language is carved stone, aged metal, folded cloth, and living forms with mechanical anatomy.

## Delivered

- Clustered column shafts, turned bases, layered capitals, and leaf ornaments. The base and shaft stay within the existing 1.15 m collision radius.
- Pointed, recessed portals with three molding layers and masonry joints; matching small passage; twin lancet windows and a twelve-petal rose with trefoil tracery.
- Connected diagonal vault ribs. Their springings meet the column capitals. The upper portal and expanding rose are separated in the stair room.
- Beveled treads with metal nosings, turned posts seated on the tread edges, and a detailed impossible return stair. Physical support still uses the shared tread dimensions in `space.ts`.
- A carved throne with pointed canopy, pinnacles, inset back, and an eye seal. Its seat remains at exactly 1.4 m, including all three saved disciple positions.
- A turned puzzle pedestal and beveled playing pieces. No player-facing instructions were added.
- A seated calico with vertex-colored patches, green irises, slit pupils, muzzle, nose, whiskers, inner ears, paws, haunches, and a curved tail. Its gaze target now follows the head height. Andrew's copies share this model.
- Twelve disciple variants with folded robes, recessed masks, mechanical arms, broken aureoles, and individually modeled augmentations. Figure identity updates when party membership changes.
- Six layered angel wings made from curved feather vanes, engraved orbital rings, a thousand rimmed eyes, and a separate central eye. John and chthonic transformations still control the eyes correctly.
- Branching shrubs with 560 instanced leaf vanes. Soft local contact shadows anchor actors to their supporting plane.

## Architecture and performance

`modeling.ts` holds reusable mesh operations: bevels, lathed profiles, curved tubes, pointed arches, vanes, static batching, and contact shadows. `models.ts` contains independently constructible assets. `rendering.ts` owns placement, visibility, and existing world hooks.

Static parts are merged by material, preserving UVs, normals, and vertex colors. Dynamic groups remain independent. Floors, columns, stairs, wings, and furniture are batched; eye and leaf populations use instancing. Cat copies and cached disciple figures share finished geometry. Gameplay state and persistence formats are unchanged.

Representative local inspection views settled around 17 ms per frame on this host. Ordinary room views used roughly 42–75 draw calls; Andrew's seven copies used 162. The angel view rendered roughly 560,000 triangles. These are observations from this browser and device, not cross-device performance guarantees.

## Acceptance evidence

- Strict TypeScript compilation and all 64 automated checks passed. The seven new checks cover finite mesh data, column clearance, beveled tread bounds, the three throne supports, shared actor geometry and twelve distinct augmentations, instanced eye counts, and pointed-arch continuity.
- Visually inspected all five rooms, all twelve disciples, the cat, the puzzle table, the throne claim, the stair underside, and the buried chamber through private fixtures.
- Inspected Andrew's cat copies, John's eye closure, and Bartholomew's phased column materials using the actual witness state machine.
- Corrected detached ear lining, open robe shoulders, unsupported vault endpoints, off-tread post bases, and upper-door/rose overlap found during the pass.
- Browser checks reported no console errors or warnings. Fixtures are served only by the local development server and excluded from `dist`.

The models remain stylized procedural assets. This pass does not add skeletal animation, realtime cast shadows, or recursive portal rendering. Existing music, puzzles, narrative, and world rules continue to operate.

Published as version 10 from `42e16b71ec8bad7b0d1583576c50171132ffd44b`. Deployment `appgdep_6ae97d5e02f081918ea4d10235f85418` succeeded. The public entry loaded without console errors. This publication receipt was appended locally after deployment.
