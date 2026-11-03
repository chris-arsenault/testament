import { homes, floorHeight } from './rooms.js';
import { witnesses } from './content.js';
import { actorPlacement, traceActor, groundAt } from './space.js';
export function stationaryWitnesses(w) { return witnesses.flatMap(({ id }) => { const s = w.party.includes(id) ? w.left.includes(id) ? w.waitSpots[id] : null : homes[id]; return s?.place === w.place ? [{ id, x: s.x, z: s.z, y: 'y' in s ? s.y : floorHeight(s.place, s.x, s.z) }] : []; }); }
export function witnessBlocksPlayer(w, x, z) { return stationaryWitnesses(w).some(p => w.y < p.y + 1.9 && w.y + 1.7 > p.y && Math.hypot(x - p.x, z - p.z) < .62 && Math.hypot(x - p.x, z - p.z) <= Math.hypot(w.x - p.x, w.z - p.z)); }
export function formationPoint(w, index, heading) { const side = (index - 1) * 1.35, behind = 2.4 + (index === 1 ? .5 : 0); return { x: w.x + Math.sin(heading) * behind + Math.cos(heading) * side, z: w.z + Math.cos(heading) * behind - Math.sin(heading) * side }; }
export function turnToward(from, to, amount) { const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from)); return from + delta * Math.min(1, amount); }
function bodyBlocked(from, to, radius, height, blockers) {
    return blockers.some(p => to.y < p.y + 1.9 && to.y + height > p.y && Math.hypot(to.x - p.x, to.z - p.z) < radius + .24 && Math.hypot(to.x - p.x, to.z - p.z) <= Math.hypot(from.x - p.x, from.z - p.z) + 1e-8);
}
function traceBodies(w, from, to, radius, height, blockers) {
    if (!blockers.length)
        return traceActor(w, from, to, .34, radius, height);
    const count = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / .1)), dx = (to.x - from.x) / count, dz = (to.z - from.z) / count;
    let p = { ...from };
    for (let i = 0; i < count; i++) {
        const next = traceActor(w, p, { x: p.x + dx, y: p.y, z: p.z + dz }, .34, radius, height);
        if (!bodyBlocked(p, next, radius, height, blockers))
            p = next;
    }
    return p;
}
function clearGoal(w, state, target, radius, height, blockers) {
    let goal = { ...target };
    for (let pass = 0; pass < 3; pass++)
        for (const b of blockers) {
            const dx = goal.x - b.x, dz = goal.z - b.z, d = Math.hypot(dx, dz);
            if (goal.y >= b.y + 1.9 || goal.y + height <= b.y || d >= radius + .29)
                continue;
            const ax = d > .001 ? dx : state.x - b.x, az = d > .001 ? dz : state.z - b.z, length = Math.hypot(ax, az) || 1;
            goal = actorPlacement(w, b.x + ax / length * (radius + .29), b.z + az / length * (radius + .29), state.y + .34, radius, height);
        }
    return goal;
}
// A short cached route is needed when the useful first step leads away from the
// destination. Greedy steering alone freezes against the middle of a table.
function detour(w, start, goal, radius, bodyHeight, blockers) {
    const cell = .6, limit = Math.min(34, Math.max(10, Math.ceil(Math.hypot(goal.x - start.x, goal.z - start.z) / cell) + 5)), first = { ...start, ix: 0, iz: 0, cost: 0, score: 0 }, open = [first], costs = new Map([['0:0', 0]]), dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (let visited = 0; open.length && visited < 600; visited++) {
        let best = 0;
        for (let i = 1; i < open.length; i++)
            if (open[i].score < open[best].score)
                best = i;
        const current = open.splice(best, 1)[0];
        if (Math.hypot(current.x - goal.x, current.z - goal.z) < cell * 1.5) {
            const end = traceBodies(w, current, goal, radius, bodyHeight, blockers);
            if (Math.hypot(end.x - goal.x, end.z - goal.z) < .02) {
                const path = [end];
                let p = current;
                while (p?.parent) {
                    path.push({ x: p.x, y: p.y, z: p.z });
                    p = p.parent;
                }
                return path.reverse();
            }
        }
        for (const [ix, iz] of dirs) {
            const nx = current.ix + ix, nz = current.iz + iz;
            if (Math.abs(nx) > limit || Math.abs(nz) > limit)
                continue;
            const x = start.x + nx * cell, z = start.z + nz * cell, key = nx + ':' + nz, cost = current.cost + Math.hypot(ix, iz) * cell;
            if (cost >= (costs.get(key) ?? Infinity))
                continue;
            const reached = traceBodies(w, current, { x, y: current.y, z }, radius, bodyHeight, blockers);
            if (Math.hypot(reached.x - x, reached.z - z) > .02)
                continue;
            costs.set(key, cost);
            const handed = -(goal.z - start.z) * nx + (goal.x - start.x) * nz;
            open.push({ ...reached, ix: nx, iz: nz, cost, score: cost + Math.hypot(x - goal.x, z - goal.z) - handed * .0001, parent: current });
        }
    }
    return [];
}
// Bounded steering around nearby solid geometry. Looking around does not change formation.
export function advanceActor(w, state, target, dt, speed = 2.8, radius = .38, bodyHeight = 1.9, blockers = []) {
    dt = Math.max(0, Math.min(.05, dt));
    state.replan = Math.max(0, (state.replan ?? 0) - dt);
    target = clearGoal(w, state, target, radius, bodyHeight, blockers);
    if (state.routeGoal && Math.hypot(state.routeGoal.x - target.x, state.routeGoal.z - target.z) > 1.2)
        state.route = [];
    while (state.route?.length && Math.hypot(state.x - state.route[0].x, state.z - state.route[0].z) < .12)
        state.route.shift();
    const destination = state.route?.[0] ?? target, dx = destination.x - state.x, dz = destination.z - state.z, distance = Math.hypot(dx, dz), step = Math.min(distance, speed * dt);
    let best = { x: state.x, y: groundAt(w, state.x, state.z, state.y + .34), z: state.z }, score = distance;
    if (step > .001) {
        const angle = Math.atan2(dx, dz);
        for (const offset of [0, .35, -.35, .8, -.8, 1.35, -1.35]) {
            const to = { x: state.x + Math.sin(angle + offset) * step, y: state.y, z: state.z + Math.cos(angle + offset) * step };
            const p = traceBodies(w, state, to, radius, bodyHeight, blockers), d = Math.hypot(p.x - destination.x, p.z - destination.z) + Math.abs(offset) * .015;
            if (d < score) {
                best = p;
                score = d;
            }
        }
    }
    const moved = Math.hypot(best.x - state.x, best.z - state.z);
    if (moved < step * .15 && step > .02 && !state.replan) {
        state.route = detour(w, state, target, radius, bodyHeight, blockers);
        state.routeGoal = { ...target };
        state.replan = .8;
    }
    if (moved > .001)
        state.yaw = turnToward(state.yaw, Math.atan2(-(best.x - state.x), -(best.z - state.z)), dt * 7);
    state.x = best.x;
    state.z = best.z;
    if (best.y >= state.y) {
        state.y = best.y;
        state.vy = 0;
    }
    else {
        state.vy -= 14 * dt;
        state.y = Math.max(best.y, state.y + state.vy * dt);
        if (state.y === best.y)
            state.vy = 0;
    }
    return state;
}
export function newActor(w, x, z, yaw, maximum = w.y + .34, radius = .38, bodyHeight = 1.9) { return { ...actorPlacement(w, x, z, maximum, radius, bodyHeight), yaw, vy: 0, place: w.place }; }
