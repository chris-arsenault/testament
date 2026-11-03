# Engravings and the unlocated voice

## Image provenance

Both artworks were verified as public domain on their museum records and downloaded from the museums' own image endpoints. Originals are bundled locally; runtime rendering needs no museum network requests.

| Work | Source | File |
| --- | --- | --- |
| Albrecht Dürer, Adam and Eve, 1504 | https://www.metmuseum.org/art/collection/search/360385 — accession 68.793.16, Open Access | public/art/adam-and-eve.jpg |
| Albrecht Dürer, The Four Horsemen, probably c. 1496/1498 | https://www.nga.gov/artworks/57123-four-horsemen — accession 1979.39.1, public domain | public/art/four-horsemen.jpg |

The first image comes from `https://collectionapi.metmuseum.org/api/collection/v1/iiif/360385/765574/main-image`. The second comes from `https://api.nga.gov/iiif/464b9b66-3252-4269-82af-c4fcba50719b/full/!1024,1024/0/default.jpg`.

`Relics` loads each engraving as an sRGB color texture and separately as a linear bump texture. The original engraved tones supply shallow surface relief; these are image-derived lighting heights, not measured geometry. Wall plaques use both channels. The rubbed floor and crypt column use height alone. Attention increases the Eden relief, accumulated world memory deepens the Apocalypse relief, and the third reality exchanges the wall images. No collision or topology rules change.

## Scripture narrator

Quotes use the public-domain World English Bible (https://ebible.org/engwebp/). Exact sentences or contiguous excerpts were checked against Genesis 1 and 28, Ezekiel 37, Psalm 46, John 20, and Revelation 4 and 21. Excerpts are marked in their citations. Source URLs travel with each quote in `src/narrative.ts`.

The subtitle-only voice responds to arrival, ascent, stillness, doubt, division of water, the angel, returning companions, and renewal. It waits until the room card clears, holds text according to length, leaves silence between lines, suppresses repeated event disclosures, limits queue size, and clears stale material on room changes. Pausing the simulation also pauses these timings. An independent setting disables the narrator without disabling environmental sound captions.

## Cinematic framing

Arrival cards display deliberately displaced catalogue references and impossible place/time metadata. These are fictional location records, not scripture citations. The narrator's citations remain accurate. For example, the staircase catalogue says Genesis 28:13 while the narrator quotes the stairway in Genesis 28:12. The credits page explains this distinction outside play.

Room cards never capture input. Brief letterboxing, restrained fades, loop-dependent take numbers, and cast cards for EVE and the many-eyed witness emphasize cinematic authorship and unreliable documentation. Reduced-motion mode removes animated transitions. No developer instructions or names of external game creators are placed in player-facing dialogue.
