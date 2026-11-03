import * as T from '../three.module.js';
import { rooms, homes, insideRoom, floorHeight, columnHeight, gardenPiers, portalScale } from './rooms.js';
import { material, mesh, box, lathe, tube, ring, batch, archBand, vane } from './modeling.js';
import { columnModel, portalModel, portalSurround, roseModel, windowModel } from './models.js';
import { stairs } from './space.js';
const flat = (g, m, x, y, z, sx, sz) => { const p = mesh(g, new T.PlaneGeometry(sx, sz), m, x, y, z); p.rotation.x = -Math.PI / 2; return p; };
// Depth at which a door's side return meets the room polygon. Vertex doors in the
// archive need longer returns than doors cut into a flat wall.
export function portalWallDepth(place, door, offset) {
    const r = rooms[place], p = r.doors[door], rotation = door === 'left' ? Math.PI / 2 : door === 'right' ? -Math.PI / 2 : 0, nx = -Math.sin(rotation), nz = -Math.cos(rotation), x = p.x + Math.cos(rotation) * offset, z = p.z - Math.sin(rotation) * offset;
    let depth = -Infinity;
    for (let i = 0; i < r.shape.length; i++) {
        const a = r.shape[i], b = r.shape[(i + 1) % r.shape.length], ex = b[0] - a[0], ez = b[1] - a[1], den = nx * ez - nz * ex;
        if (Math.abs(den) < 1e-8)
            continue;
        const ax = a[0] - x, az = a[1] - z, t = (ax * ez - az * ex) / den, u = (ax * nz - az * nx) / den;
        if (u >= 0 && u <= 1)
            depth = Math.max(depth, t);
    }
    return Number.isFinite(depth) ? depth : .95;
}
export function groundGeometry(place) {
    const r = rooms[place];
    if (place !== 'garden') {
        const s = new T.Shape();
        r.shape.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z));
        s.closePath();
        const g = new T.ShapeGeometry(s);
        g.rotateX(-Math.PI / 2);
        return g;
    }
    const g = new T.PlaneGeometry(32, 32, 80, 80);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, indices = [], colors = [];
    for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i), h = floorHeight(place, x, z);
        p.setY(i, h);
        const c = new T.Color().setHSL(.22 + .025 * Math.sin(x * .7), .23, .23 + h * .045);
        colors.push(c.r, c.g, c.b);
    }
    const old = g.index.array;
    for (let i = 0; i < old.length; i += 3) {
        const a = old[i], b = old[i + 1], c = old[i + 2];
        if (insideRoom(place, (p.getX(a) + p.getX(b) + p.getX(c)) / 3, (p.getZ(a) + p.getZ(b) + p.getZ(c)) / 3))
            indices.push(a, b, c);
    }
    g.setIndex(indices);
    g.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
}
export function onTerrain(root) { root.traverse((m) => { if (!m.isMesh)
    return; if (m.isInstancedMesh) {
    const matrix = new T.Matrix4(), p = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3();
    for (let i = 0; i < m.count; i++) {
        m.getMatrixAt(i, matrix);
        matrix.decompose(p, q, s);
        p.y += floorHeight('garden', p.x, p.z);
        matrix.compose(p, q, s);
        m.setMatrixAt(i, matrix);
    }
    m.instanceMatrix.needsUpdate = true;
}
else {
    m.geometry = m.geometry.clone();
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++)
        p.setY(i, p.getY(i) + floorHeight('garden', p.getX(i), p.getZ(i)));
    m.geometry.computeVertexNormals();
    m.geometry.computeBoundingSphere();
} }); }
export class RoomScenery {
    parent;
    columnMats;
    views = {};
    constructor(parent, columnMats) {
        this.parent = parent;
        this.columnMats = columnMats;
    }
    show(w, time, reduced) { const current = this.views[w.place] ??= this.build(w.place); for (const [id, v] of Object.entries(this.views))
        v.root.visible = id === w.place; current.ceiling.visible = !w.ceiling; if (current.rose) {
        current.rose.rotation.z = reduced ? 0 : time * .008;
        current.rose.scale.setScalar(w.ceiling ? 1.3 : 1);
        current.rose.position.y = (w.place === 'stair' ? 20.2 : 11.8) + (w.ceiling ? 1.05 : 0);
    } }
    build(place) {
        const r = rooms[place], root = new T.Group(), solid = new T.Group(), ceiling = new T.Group();
        root.name = 'room-' + place;
        root.add(solid, ceiling);
        this.parent.add(root);
        const stone = material(r.wall, .08, .85), floor = material(r.floor, .08, .8), gold = material(r.accent, .6, .48), dark = material(place === 'garden' ? '#36432d' : '#263339'), light = material('#c7d8be', .2, .4);
        light.emissive = new T.Color(r.accent);
        light.emissiveIntensity = .5;
        if (place === 'garden')
            floor.vertexColors = true;
        mesh(solid, groundGeometry(place), floor);
        const alternate = material(place === 'nave' ? '#56605a' : place === 'water' ? '#325c65' : place === 'crypt' ? '#383443' : place === 'choir' ? '#a5aea6' : '#4d433c');
        if (place === 'nave' || place === 'water' || place === 'crypt')
            for (let x = -18; x <= 18; x += place === 'water' ? 1.4 : 2)
                for (let z = -18; z <= 18; z += place === 'water' ? 1.4 : 2) {
                    const size = place === 'water' ? 1.32 : place === 'crypt' ? 1.36 : 1.92;
                    if (!insideRoom(place, x, z, size * .72))
                        continue;
                    const tile = flat(solid, (Math.round(x * 5 + z * 5) % 4 === 0) ? floor : alternate, x, .012, z, size, size);
                    if (place === 'crypt')
                        tile.rotation.z = Math.PI / 4;
                }
        if (place === 'stair')
            for (let z = -16; z < 13; z += 1.5)
                for (let x = -5; x < 6; x += 1.1) {
                    if (!insideRoom(place, x, z, 1.1))
                        continue;
                    flat(solid, alternate, x, .012, z, .28, 1.35).rotation.z = (Math.floor(z) % 2 ? 1 : -1) * Math.PI / 4;
                }
        if (place === 'scriptorium' || place === 'choir') {
            for (let radius = 2; radius < (place === 'choir' ? 11 : 12); radius += 1.7)
                ring(solid, gold, radius, .025, 0, .024, 0).rotation.x = -Math.PI / 2;
            for (let i = 0; i < (place === 'choir' ? 48 : 12); i++) {
                const a = i * Math.PI * 2 / (place === 'choir' ? 48 : 12), length = place === 'choir' ? 10.6 : 10.7;
                const strip = box(solid, alternate, Math.sin(a) * length * .5, .015, Math.cos(a) * length * .5, .035, .015, length, .004);
                strip.rotation.y = a;
            }
        }
        // Room boundaries and portal centers come from the same polygons used by movement.
        for (let i = 0; i < r.shape.length; i++) {
            const a = r.shape[i], b = r.shape[(i + 1) % r.shape.length], dx = b[0] - a[0], dz = b[1] - a[1], length = Math.hypot(dx, dz), count = Math.ceil(length / .75), angle = Math.atan2(dx, dz);
            for (let j = 0; j < count; j++) {
                const t = (j + .5) / count, x = a[0] + dx * t, z = a[1] + dz * t;
                if (Object.values(r.doors).some(d => Math.hypot(x - d.x, z - d.z) < 3))
                    continue;
                const h = place === 'garden' ? 2.4 + 1.4 * (.5 + .5 * Math.sin(i * 2 + j)) : r.height, y = floorHeight(place, x, z);
                const wall = box(solid, stone, x, y + h / 2, z, .48, h, length / count + .025, .025);
                wall.rotation.y = angle;
                if (place === 'water') {
                    for (const yy of [.35, 2.5, 5.5])
                        box(solid, gold, x, y + yy, z, .52, .07, length / count, .01).rotation.y = angle;
                }
                if (place === 'choir' && j % 2 === 0) {
                    const p = mesh(solid, new T.CylinderGeometry(.12, .16, r.height, 8), gold, x * .97, r.height / 2, z * .97);
                    p.name = 'fluted-wall';
                }
            }
            if (place === 'scriptorium') {
                for (let j = 0; j < Math.floor(length / 1.05); j++) {
                    const t = (j + .5) / Math.floor(length / 1.05), x = (a[0] + dx * t) * .95, z = (a[1] + dz * t) * .95;
                    if (Object.values(r.doors).some(d => Math.hypot(x - d.x, z - d.z) < 3.1))
                        continue;
                    for (let row = 0; row < 5; row++) {
                        box(solid, dark, x, 1 + row * 1.65, z, .65, .12, 1.1, .025).rotation.y = angle;
                        for (let k = 0; k < 4; k++) {
                            const m = box(solid, k % 2 ? gold : alternate, x + Math.sin(angle) * (k - 1.5) * .22, 1.55 + row * 1.65, z + Math.cos(angle) * (k - 1.5) * .22, .35, .72 + (k % 3) * .13, .18, .014);
                            m.rotation.y = angle;
                        }
                    }
                }
            }
            if (place === 'crypt' && length > 6) {
                const x = (a[0] + b[0]) * .48, z = (a[1] + b[1]) * .48;
                if (!Object.values(r.doors).some(d => Math.hypot(x - d.x, z - d.z) < 3)) {
                    const recess = box(solid, dark, x, 2.1, z, .1, 2.8, 1.4, .12);
                    recess.rotation.y = angle;
                }
            }
        }
        const portal = portalModel(stone, dark, gold), scale = portalScale(place);
        for (const [name, p] of Object.entries(r.doors)) {
            const d = portal.clone(true), elevation = place === 'stair' && name === 'front' ? 8.1 : 0;
            d.position.set(p.x, floorHeight(place, p.x, p.z) + elevation, p.z);
            d.rotation.y = name === 'left' ? Math.PI / 2 : name === 'right' ? -Math.PI / 2 : 0;
            d.scale.y = scale;
            root.add(d);
            if (place !== 'garden') {
                const surround = portalSurround(stone, r.height - elevation, scale);
                surround.position.copy(d.position);
                surround.rotation.y = d.rotation.y;
                solid.add(surround);
                const returns = new T.Group();
                returns.position.copy(d.position);
                returns.rotation.y = d.rotation.y;
                solid.add(returns);
                for (const side of [-3.25, 3.25]) {
                    const depth = portalWallDepth(place, name, side);
                    box(returns, stone, side, (r.height - elevation) / 2, -(.95 + depth) / 2, .22, r.height - elevation, Math.abs(.95 - depth) + .15, .015);
                }
            }
        }
        const cm = [stone, dark, gold].map(m => { const c = m.clone(); c.transparent = true; this.columnMats.push(c); return c; }), column = columnModel(cm[0], cm[1], cm[2]);
        for (const p of r.columns) {
            const c = column.clone(true);
            c.position.set(p.x, 0, p.z);
            c.scale.y = columnHeight(place) / 11;
            root.add(c);
        }
        let rose = null;
        if (place === 'nave' || place === 'stair') {
            rose = roseModel(stone, gold);
            rose.position.set(0, place === 'stair' ? 20.2 : 11.8, r.doors.front.z - .25);
            root.add(rose);
            box(solid, stone, 0, r.height / 2, -18.1, 8, r.height, .3, .01);
            if (place === 'nave') {
                for (const z of [-10, 0, 10]) {
                    archBand(solid, stone, 6.9, 10.9, 7.1, .24, .35, z);
                    archBand(solid, gold, 6.72, 10.9, 6.92, .06, .15, z + .23);
                }
                for (const z of [-10, 0])
                    for (const side of [-1, 1])
                        tube(ceiling, dark, [[side * 7, 10.9, z], [side * 5, 14.5, z + 2.5], [0, 18, z + 5], [-side * 5, 14.5, z + 7.5], [-side * 7, 10.9, z + 10]], .12, 32, 8);
                const window = windowModel(stone, gold, light);
                for (const x of [-12.6, 12.6])
                    for (const z of [-12, -6, 6, 12]) {
                        const win = window.clone(true);
                        win.position.set(x, 4.4, z);
                        win.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                        root.add(win);
                    }
            }
            else {
                for (const z of [-10, -2, 7])
                    archBand(ceiling, gold, 5, 11, 12, .1, .2, z);
                for (const [i, step] of stairs.entries()) {
                    box(solid, stone, step.x, step.y - .15, step.z, step.width, .3, step.depth, .025);
                    box(solid, gold, 0, step.y - .035, step.z + .36, 3.9, .035, .02, .004);
                    if (i % 3 === 0)
                        for (const x of [-1.94, 1.94]) {
                            const post = lathe(solid, gold, [[.1, 0], [.1, .08], [.05, .16], [.04, .8], [.07, .9], [0, 1]], 10);
                            post.position.set(x, step.y - .05, step.z);
                        }
                }
                for (let i = 0; i < 30; i++) {
                    const a = i * .18, g = box(solid, stone, Math.cos(a) * 4.7, 13 + i * .2, -3 + Math.sin(a) * 6, 1.8, .18, 1, .025);
                    g.rotation.y = -a;
                }
            }
        }
        if (place === 'water' || place === 'crypt') {
            const roof = mesh(ceiling, groundGeometry(place), stone, 0, r.height, 0);
            roof.rotation.z = Math.PI;
            if (place === 'crypt')
                for (const z of [-7, -1, 5])
                    archBand(ceiling, gold, 7, 3.7, 3.3, .14, .25, z);
            else
                for (const z of [-8, -3, 3, 8])
                    for (let x = -15; x <= 15; x += 3)
                        box(ceiling, gold, x, 6.08, z, .09, .2, 4, .012);
        }
        if (place === 'scriptorium') {
            for (const y of [4.5, 8.5])
                for (let i = 0; i < 6; i++) {
                    const a = i * Math.PI / 3;
                    const rail = box(solid, gold, Math.cos(a) * 10.7, y, Math.sin(a) * 10.7, .14, .16, 10.5, .02);
                    rail.rotation.y = -a;
                }
            ring(ceiling, gold, 5, .08, 0, 10, 0).rotation.x = -Math.PI / 2;
        }
        if (place === 'choir') {
            const crown = mesh(ceiling, new T.RingGeometry(3.8, 11, 64), stone, 0, 22, 0);
            crown.rotation.x = Math.PI / 2;
            for (let i = 0; i < 28; i++) {
                const a = i * Math.PI / 14, h = 3 + (i % 7) * .45;
                mesh(ceiling, new T.CylinderGeometry(.16, .16, h, 12), gold, Math.sin(a) * 4.6, 21 - h / 2, Math.cos(a) * 4.6);
            }
            for (const radius of [3.8, 5.2])
                ring(ceiling, gold, radius, .09, 0, 19, 0).rotation.x = Math.PI / 2;
        }
        for (const [index, [id, home]] of Object.entries(homes).entries()) {
            if (home.place !== place)
                continue;
            const y = floorHeight(place, home.x, home.z);
            ring(solid, gold, .72, .022, home.x, y + .025, home.z).rotation.x = -Math.PI / 2;
            for (let i = 0; i <= index; i++) {
                const a = i * Math.PI * 2 / (index + 1);
                box(solid, gold, home.x + Math.sin(a) * .86, y + .025, home.z + Math.cos(a) * .86, .05, .02, .13, .006).rotation.y = a;
            }
            const lamp = mesh(solid, new T.OctahedronGeometry(.095), light, home.x + .65, y + 2.2, home.z + .15);
            lamp.name = 'home-' + id;
        }
        batch(solid);
        batch(ceiling);
        if (place === 'garden') {
            const grassMat = material('#637449', 0, .94);
            grassMat.side = T.DoubleSide;
            const grass = new T.InstancedMesh(vane(.34, .034, .08), grassMat, 2100), dummy = new T.Object3D();
            let count = 0;
            for (let i = 0; count < 2100 && i < 8000; i++) {
                const x = Math.sin(i * 41.7) * 15.7, z = Math.cos(i * 23.33) * 15.7;
                if (!insideRoom(place, x, z, .6))
                    continue;
                dummy.position.set(x, floorHeight(place, x, z), z);
                dummy.rotation.set(.1 * Math.sin(i), i * 2.399, .2 * Math.cos(i));
                dummy.scale.setScalar(.6 + (i % 9) * .09);
                dummy.updateMatrix();
                grass.setMatrixAt(count++, dummy.matrix);
            }
            grass.count = count;
            root.add(grass);
            for (const x of [-10, 10]) {
                const arch = archBand(root, stone, 2, 2.5, 3, .2, .4, -6);
                arch.position.x = x;
                arch.position.y = floorHeight(place, x, -6);
            }
            for (const p of gardenPiers) {
                const base = floorHeight(place, p.x, p.z), height = p.top - base;
                mesh(root, new T.CylinderGeometry(.2, p.radius, height, 10), stone, p.x, base + height / 2, p.z);
            }
        }
        return { root, ceiling, rose };
    }
}
