import * as T from '../three.module.js';
export const material = (color, metalness = 0, roughness = .7) => new T.MeshStandardMaterial({ color, metalness, roughness });
export function mesh(parent, geometry, mat, x = 0, y = 0, z = 0) { const m = new T.Mesh(geometry, mat); m.position.set(x, y, z); parent.add(m); return m; }
export function ellipsoid(parent, mat, x, y, z, sx, sy, sz) { const m = mesh(parent, new T.SphereGeometry(1, 24, 16), mat, x, y, z); m.scale.set(sx, sy, sz); return m; }
export function box(parent, mat, x, y, z, sx, sy, sz, bevel = .035) {
    const r = Math.min(bevel, sx / 4, sy / 4, sz / 4), s = new T.Shape();
    s.moveTo(-sx / 2 + r, -sy / 2 + r);
    s.lineTo(sx / 2 - r, -sy / 2 + r);
    s.lineTo(sx / 2 - r, sy / 2 - r);
    s.lineTo(-sx / 2 + r, sy / 2 - r);
    s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: sz - 2 * r, steps: 1, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 1, curveSegments: 1 });
    g.translate(0, 0, -sz / 2 + r);
    return mesh(parent, g, mat, x, y, z);
}
export function lathe(parent, mat, profile, segments = 32) { return mesh(parent, new T.LatheGeometry(profile.map(p => new T.Vector2(p[0], p[1])), segments), mat); }
export function tube(parent, mat, points, radius, segments = 32, sides = 8) { return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), segments, radius, sides, false), mat); }
export function ring(parent, mat, r, t, x = 0, y = 0, z = 0, arc = Math.PI * 2) { return mesh(parent, new T.TorusGeometry(r, t, 8, 64, arc), mat, x, y, z); }
// Merge only static model parts. Each material becomes one draw; groups remain movable.
// UVs, normals and vertex colours survive, so modeled calico patches need no image asset.
export function batch(root) {
    root.updateMatrixWorld(true);
    const inverse = root.matrixWorld.clone().invert(), buckets = new Map();
    root.traverse((m) => {
        if (!m.isMesh || m.isInstancedMesh)
            return;
        const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        g.applyMatrix4(inverse.clone().multiply(m.matrixWorld));
        const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, c = g.attributes.color;
        let b = buckets.get(m.material);
        if (!b) {
            b = { p: [], n: [], u: [], c: [] };
            buckets.set(m.material, b);
        }
        for (let i = 0; i < p.count; i++) {
            b.p.push(p.getX(i), p.getY(i), p.getZ(i));
            b.n.push(n.getX(i), n.getY(i), n.getZ(i));
            b.u.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
            b.c.push(c ? c.getX(i) : 1, c ? c.getY(i) : 1, c ? c.getZ(i) : 1);
        }
        g.dispose();
    });
    // Source geometries have no other owners; clones of the finished model share the batches.
    const disposed = new Set();
    root.traverse((m) => { if (m.isMesh && !disposed.has(m.geometry)) {
        m.geometry.dispose();
        disposed.add(m.geometry);
    } });
    root.clear();
    for (const [mat, b] of buckets) {
        const g = new T.BufferGeometry();
        for (const [key, values, size] of [['position', b.p, 3], ['normal', b.n, 3], ['uv', b.u, 2], ['color', b.c, 3]])
            g.setAttribute(key, new T.Float32BufferAttribute(values, size));
        g.computeBoundingSphere();
        mesh(root, g, mat);
    }
    return root;
}
// A pointed arch with a vertical tangent at each springing, used at every scale.
export function ogive(half, spring, rise, z = 0) {
    const out = [];
    for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        out.push([-half + half * t * t, spring + rise * (1.4 * t - .4 * t * t), z]);
    }
    for (let i = 1; i <= 24; i++) {
        const t = i / 24;
        out.push([half * (2 * t - t * t), spring + rise * (1 - .6 * t - .4 * t * t), z]);
    }
    return out;
}
export function archBand(parent, mat, half, spring, rise, width, depth, z = 0) {
    const points = ogive(half, spring, rise), shape = new T.Shape();
    shape.moveTo(points[0][0] - width, points[0][1]);
    for (const p of points)
        shape.lineTo(p[0] * (1 + width / half), p[1] + width * (p[1] - spring) / rise);
    for (let i = points.length - 1; i >= 0; i--)
        shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 1, steps: 1 });
    return mesh(parent, g, mat, 0, 0, z - depth / 2);
}
// Curved, lenticular vane, with a raised quill and an edge taper instead of a cone.
export function vane(length, width, bend = .16) {
    const p = [], uv = [], indices = [];
    const rows = 12, cols = 6;
    for (let i = 0; i <= rows; i++) {
        const t = i / rows, w = width * Math.pow(Math.sin(Math.PI * t), .72) * (.9 + .1 * t);
        for (let j = 0; j <= cols; j++) {
            const s = j / cols * 2 - 1;
            p.push(s * w, length * t, bend * t * t + .055 * (1 - s * s) * Math.sin(Math.PI * t));
            uv.push(j / cols, t);
        }
    }
    for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++) {
            const a = i * (cols + 1) + j, b = a + cols + 1;
            indices.push(a, a + 1, b, a + 1, b + 1, b);
        }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(p, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
}
let contactTexture;
export function contactShadow(rx, rz, opacity = .28) {
    if (!contactTexture) {
        const data = new Uint8Array(64 * 64 * 4);
        for (let y = 0; y < 64; y++)
            for (let x = 0; x < 64; x++) {
                const r = Math.hypot((x - 31.5) / 31.5, (y - 31.5) / 31.5), i = (y * 64 + x) * 4;
                data[i] = data[i + 1] = data[i + 2] = 255;
                data[i + 3] = Math.round(255 * Math.pow(Math.max(0, 1 - r), 2));
            }
        contactTexture = new T.DataTexture(data, 64, 64);
        contactTexture.needsUpdate = true;
    }
    const m = new T.Mesh(new T.PlaneGeometry(rx * 2, rz * 2, 6, 6), new T.MeshBasicMaterial({ color: '#081014', map: contactTexture, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = .022;
    m.userData.contactShadow = true;
    return m;
}
// Displace static details in world space, including translated/rotated children.
// Copies own their displaced geometry; the source model stays reusable elsewhere.
export function drapeTerrain(root, height) {
    root.updateWorldMatrix(true, true);
    root.traverse((m) => {
        if (!m.isMesh)
            return;
        const inverse = m.matrixWorld.clone().invert();
        if (m.isInstancedMesh) {
            const matrix = new T.Matrix4(), p = new T.Vector3();
            for (let i = 0; i < m.count; i++) {
                m.getMatrixAt(i, matrix);
                matrix.premultiply(m.matrixWorld);
                p.setFromMatrixPosition(matrix);
                matrix.elements[13] += height(p.x, p.z);
                matrix.premultiply(inverse);
                m.setMatrixAt(i, matrix);
            }
            m.instanceMatrix.needsUpdate = true;
            m.boundingBox = m.boundingSphere = null;
        }
        else {
            const geometry = m.geometry.clone();
            geometry.applyMatrix4(m.matrixWorld);
            const p = geometry.attributes.position;
            for (let i = 0; i < p.count; i++)
                p.setY(i, p.getY(i) + height(p.getX(i), p.getZ(i)));
            geometry.applyMatrix4(inverse);
            geometry.computeVertexNormals();
            geometry.computeBoundingSphere();
            m.geometry = geometry;
        }
    });
    return root;
}
// Contact cards follow the actual support beneath every vertex. Each actor gets
// its own mutable card while continuing to share the expensive sculpted model.
export function groundShadows(root, surface) {
    root.updateWorldMatrix(true, true);
    root.traverse((shadow) => {
        if (!shadow.userData.contactShadow)
            return;
        let state = shadow.userData.shadowSurface;
        if (!state || state.owner !== shadow.uuid) {
            shadow.geometry = shadow.geometry.clone();
            shadow.material = shadow.material.clone();
            shadow.geometry.attributes.position.setUsage(T.DynamicDrawUsage);
            state = shadow.userData.shadowSurface = { owner: shadow.uuid, flat: state?.flat ?? Array.from(shadow.geometry.attributes.position.array), opacity: state?.opacity ?? shadow.material.opacity };
        }
        const positions = shadow.geometry.attributes.position, inverse = shadow.matrixWorld.clone().invert(), point = new T.Vector3(), center = new T.Vector3().setFromMatrixPosition(shadow.matrixWorld), height = surface(center.x, center.z, center.y + .06);
        shadow.material.opacity = state.opacity / (1 + Math.max(0, center.y - height - .022) ** 2 * 2);
        for (let i = 0; i < positions.count; i++) {
            point.set(state.flat[i * 3], state.flat[i * 3 + 1], state.flat[i * 3 + 2]).applyMatrix4(shadow.matrixWorld);
            point.y = surface(point.x, point.z, center.y + .06) + .018;
            point.applyMatrix4(inverse);
            positions.setXYZ(i, point.x, point.y, point.z);
        }
        positions.needsUpdate = true;
        shadow.geometry.boundingBox = null;
        shadow.geometry.computeBoundingSphere();
    });
}
