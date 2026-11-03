import { manifestation, witnessGravity, witnessBodyHeight, rootObstructs } from './witnesses.js';
import { rooms, floorHeight, insideRoom, roomPoint, columnHeight } from './rooms.js';
export const stairs = Array.from({ length: 36 }, (_, i) => ({ x: 0, z: 8 - i * .7, y: i * .23, width: 4, depth: .72 }));
export function surfaces(place, x, z) {
    const heights = [floorHeight(place, x, z)];
    if (place === 'stair')
        for (const step of stairs)
            if (Math.abs(x - step.x) <= step.width / 2 && Math.abs(z - step.z) <= step.depth / 2)
                heights.push(step.y);
    return heights.sort((a, b) => a - b);
}
export function support(place, x, z, maximum = Infinity) { return Math.max(floorHeight(place, x, z), ...surfaces(place, x, z).filter(y => y <= maximum + .001)); }
export function groundAt(w, x, z, maximum = Infinity) { const m = manifestation(w, 'thomas'), floor = support(w.place, x, z, maximum); return m && Math.abs(x - m.x) <= 2 && Math.abs(z - m.z) <= 2 && m.y <= maximum + .001 ? Math.max(floor, m.y) : floor; }
export function obstructed(w, x, z, y = w.y) {
    if (rootObstructs(w, x, z, y))
        return true;
    if (!manifestation(w, 'bartholomew'))
        for (const { x: px, z: pz } of rooms[w.place].columns)
            if (y < columnHeight(w.place) && Math.hypot(x - px, z - pz) < (manifestation(w, 'alphaeus') ? .7 : 1.15))
                return true;
    if (w.place === 'water' && !w.bridge && Math.abs(x) < 4 && z < 2 && z > -6)
        return true;
    if (w.place === 'nave' && !w.skin && !w.stable && Math.abs(x) < 3 && Math.abs(z + 2) < .55 && y < 4)
        return true;
    if (w.place === 'stair')
        for (const top of surfaces('stair', x, z))
            if (top > y + .32 && top - .3 < y + witnessBodyHeight(w) - .05)
                return true;
    return false;
}
export function stepSupport(w, dt) {
    const ground = groundAt(w, w.x, w.z, w.y + .02);
    if (w.y <= ground + .025 && w.vy <= 0) {
        w.y = ground;
        w.vy = 0;
        return;
    }
    w.vy -= witnessGravity(w) * dt;
    const next = w.y + w.vy * dt;
    if (next <= ground) {
        w.y = ground;
        w.vy = 0;
    }
    else
        w.y = next;
}
export function settleWitnessBody(w, restoring = false) {
    const phase = w.manifestations.bartholomew;
    if ((restoring || phase?.ended && phase.place === w.place) && w.y < columnHeight(w.place))
        for (const { x: px, z: pz } of rooms[w.place].columns) {
            const r = Math.hypot(w.x - px, w.z - pz);
            if (r < 1.16) {
                const dx = r ? (w.x - px) / r : 1, dz = r ? (w.z - pz) / r : 0;
                w.x = px + dx * 1.22;
                w.z = pz + dz * 1.22;
            }
        }
    const small = w.manifestations.alphaeus;
    if (small?.ended && small.place === w.place && obstructed(w, w.x, w.z)) {
        small.remaining = .1;
        small.visual = Math.max(small.visual, .1);
    }
    if (restoring && obstructed(w, w.x, w.z)) {
        if (w.place === 'stair') {
            w.x = w.x < 0 ? -2.6 : 2.6;
            w.y = 0;
        }
        else if (w.place === 'water')
            w.x = w.x < 0 ? -4.6 : 4.6;
        else
            w.z += 1.2;
    }
}
// Project gaze onto real horizontal surfaces, then trace a reachable path to the chosen point.
export function gazeLanding(w, direction, eyeHeight = 1.7) {
    const origin = { x: w.x, y: w.y + eyeHeight, z: w.z };
    let desired;
    if (direction.y < -.025) {
        const ledge = manifestation(w, 'thomas');
        const candidates = [...(ledge ? [{ x: ledge.x, y: ledge.y, z: ledge.z, width: 4, depth: 4 }] : []), { y: 0, x: 0, z: 0, width: 24, depth: 33 }, ...(w.place === 'stair' ? stairs : [])];
        let nearest = 14;
        for (const s of candidates) {
            const t = (s.y - origin.y) / direction.y;
            if (t < .65 || t > nearest)
                continue;
            const x = origin.x + direction.x * t, z = origin.z + direction.z * t;
            if (Math.abs(x - s.x) <= s.width / 2 && Math.abs(z - s.z) <= s.depth / 2) {
                desired = { x, y: s.y, z };
                nearest = t;
            }
        }
    }
    if (!desired) {
        const horizontal = Math.hypot(direction.x, direction.z) || 1;
        desired = { x: w.x + direction.x / horizontal * 5, y: w.y, z: w.z + direction.z / horizontal * 5 };
    }
    desired = roomPoint(w.place, desired.x, desired.z, .7);
    let point = { x: w.x, y: w.y, z: w.z };
    const count = Math.ceil(Math.hypot(desired.x - w.x, desired.z - w.z) / .15) || 1;
    for (let i = 1; i <= count; i++) {
        const x = w.x + (desired.x - w.x) * i / count, z = w.z + (desired.z - w.z) * i / count;
        if (!insideRoom(w.place, x, z, .4) || obstructed(w, x, z, point.y))
            break;
        point = { x, y: groundAt(w, x, z, point.y + .32), z };
    }
    return point;
}
