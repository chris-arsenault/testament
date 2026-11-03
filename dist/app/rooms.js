export const places = ['nave', 'stair', 'garden', 'water', 'crypt', 'scriptorium', 'choir'];
const rect = (x, z) => [[-x, -z], [x, -z], [x, z], [-x, z]];
const circle = (r, n = 32) => Array.from({ length: n }, (_, i) => [Math.sin(i / n * Math.PI * 2) * r, -Math.cos(i / n * Math.PI * 2) * r]);
const columns = (x, zs) => [-x, x].flatMap(x => zs.map(z => ({ x, z })));
export const rooms = {
    nave: { shape: rect(13, 18), height: 19, spawn: { x: 0, z: 12 }, table: { x: -3.7, z: 8 }, doors: { front: { x: 0, z: -17 }, left: { x: -12.5, z: 0 }, right: { x: 12.5, z: 0 } }, columns: columns(7, [-10, 0, 10]), wall: '#898b80', floor: '#96988b', accent: '#968059', sky: '#171e26', light: '#ffe1b2', seal: 'exile' },
    stair: { shape: [[-5, -18], [5, -18], [7, -12], [7, 8], [5, 14], [-5, 14], [-7, 8], [-7, -12]], height: 26, spawn: { x: 0, z: 11 }, table: { x: -3.8, z: 5 }, doors: { front: { x: 0, z: -17 }, left: { x: -6.5, z: 0 }, right: { x: 6.5, z: 0 } }, columns: columns(5, [-10, 7]), wall: '#4c5768', floor: '#6e7983', accent: '#b6a079', sky: '#131c30', light: '#c1d8ed', seal: 'lament' },
    garden: { shape: circle(16), height: 4.5, spawn: { x: 0, z: 11 }, table: { x: -7, z: 6 }, doors: { front: { x: 0, z: -15.5 }, left: { x: -15.5, z: 0 }, right: { x: 15.5, z: 0 } }, columns: [], wall: '#5a6850', floor: '#4c613a', accent: '#8c9972', sky: '#677c70', light: '#e3edbd', seal: 'table' },
    water: { shape: [[-12, -12], [12, -12], [18, -6], [18, 6], [12, 12], [-12, 12], [-18, 6], [-18, -6]], height: 6.3, spawn: { x: 0, z: 9 }, table: { x: -9, z: 4 }, doors: { front: { x: 0, z: -11.5 }, left: { x: -17.5, z: 0 }, right: { x: 17.5, z: 0 } }, columns: columns(12, [-6, 6]), wall: '#35666b', floor: '#739a96', accent: '#c1a574', sky: '#112a34', light: '#acdfe3', seal: 'division' },
    crypt: { shape: [[-6, -14], [6, -14], [9, -10], [9, 6], [6, 10], [-6, 10], [-9, 6], [-9, -10]], height: 7.4, spawn: { x: 0, z: 7 }, table: { x: -5, z: 4 }, doors: { front: { x: 0, z: -13.5 }, left: { x: -8.5, z: 0 }, right: { x: 8.5, z: 0 } }, columns: columns(7, [-7, 5]), wall: '#302d3b', floor: '#514e5b', accent: '#9c8598', sky: '#131018', light: '#c3b3d8', seal: 'bones' },
    scriptorium: { shape: circle(13, 6).map(([x, z]) => [z, x]), height: 11, spawn: { x: 0, z: 7.5 }, table: { x: 0, z: 3.6 }, doors: { front: { x: 0, z: -10.8 }, left: { x: -12.5, z: 0 }, right: { x: 12.5, z: 0 } }, columns: [], wall: '#664b35', floor: '#8c7658', accent: '#c4a260', sky: '#21170f', light: '#f1c88b', seal: 'letters' },
    choir: { shape: circle(11, 32), height: 22, spawn: { x: 0, z: 7.5 }, table: { x: -4, z: 3 }, doors: { front: { x: 0, z: -10.5 }, left: { x: -10.5, z: 0 }, right: { x: 10.5, z: 0 } }, columns: [], wall: '#c7c7ba', floor: '#d0d3c7', accent: '#b4a58c', sky: '#293237', light: '#ecf1e5', seal: 'renewal' }
};
export const homes = {
    peter: { place: 'nave', x: -5, z: 3, yaw: Math.PI }, alphaeus: { place: 'stair', x: 4, z: 5, yaw: 0 },
    john: { place: 'garden', x: -7, z: -3, yaw: Math.PI / 2 }, jude: { place: 'garden', x: 7, z: 5, yaw: 0 },
    andrew: { place: 'water', x: -8, z: -6, yaw: Math.PI }, matthew: { place: 'water', x: 8, z: 5, yaw: 0 },
    judas: { place: 'crypt', x: -5, z: -6, yaw: Math.PI }, simon: { place: 'crypt', x: 5, z: -5, yaw: Math.PI },
    philip: { place: 'scriptorium', x: -7, z: -4, yaw: Math.PI }, bartholomew: { place: 'scriptorium', x: 7, z: -4, yaw: Math.PI },
    james: { place: 'choir', x: -4, z: -3, yaw: Math.PI }, thomas: { place: 'choir', x: 4, z: -3, yaw: Math.PI }
};
export function floorHeight(place, x, z) { return place === 'garden' ? .7 + .28 * Math.sin(x * .35) + .23 * Math.cos(z * .3) + .12 * Math.sin((x + z) * .42) : 0; }
export function insideRoom(place, x, z, margin = 0) { const p = rooms[place].shape; let inside = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [ax, az] = p[i], [bx, bz] = p[j];
    if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax)
        inside = !inside;
    if (margin) {
        const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
        if (Math.hypot(x - ax - t * dx, z - az - t * dz) < margin)
            return false;
    }
} return inside; }
export function roomPoint(place, x, z, margin = .5) { for (let i = 0; i < 100 && !insideRoom(place, x, z, margin); i++) {
    x *= .94;
    z *= .94;
} return { x, z, y: floorHeight(place, x, z) }; }
export function nearPortal(place, x, z) { return Object.entries(rooms[place].doors).find(([, p]) => Math.hypot(x - p.x, z - p.z) < 1.05)?.[0]; }
export const columnHeight = (place) => 11 * (place === 'water' ? .55 : place === 'crypt' ? .34 : 1);
// Shared with the stonework and movement code: these are actual modeled surfaces.
export const pool = { left: -4, right: 4, back: -6, front: 2 };
export const bridgeDeck = { halfWidth: 1, back: -6.4, front: 2.4, top: .325 };
export const tableBounds = { halfWidth: .9, top: 1.03 };
export const gardenPiers = [-12, -8, 8, 12].map(x => ({ x, z: -6, radius: .3, top: floorHeight('garden', x < 0 ? -10 : 10, -6) + 2.5 }));
export const portalScale = (place) => place === 'water' ? .66 : place === 'garden' ? .62 : place === 'crypt' ? .75 : place === 'scriptorium' ? .95 : 1;
