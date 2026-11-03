import { WitnessVisuals } from './witness-visuals.js';
import { columnModel, portalModel, roseModel, windowModel, throneModel, tableModel, catModel, discipleModel, angelModel, gardenModel } from './models.js';
import { batch, box as carvedBox, archBand, tube, lathe } from './modeling.js';
import { witnesses } from './content.js';
import { manifestation, witnessVisual, witnessBodyHeight, catCopies } from './witnesses.js';
import { returningRoots } from './roots.js';
import { stairs, groundAt, gazeLanding } from './space.js';
import { Relics } from './relics.js';
import * as T from '../three.module.js';
import { throneVisible } from './world.js';
export class Cathedral {
    figures = {};
    centralEye;
    effects;
    columnMats = [];
    copies = [];
    pupils;
    burial;
    scar;
    table;
    relics;
    scene;
    camera;
    renderer;
    root;
    cat;
    angel;
    eyes;
    wings;
    water;
    bridge;
    screen;
    roots;
    ceiling;
    throne;
    low;
    companions = [];
    letter;
    light;
    rose;
    dust;
    clock = 0;
    lastPlace = '';
    materials = [];
    constructor(canvas) {
        this.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.outputColorSpace = T.SRGBColorSpace;
        this.renderer.toneMapping = T.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.scene = new T.Scene();
        this.scene.background = new T.Color('#171c22');
        this.scene.fog = new T.FogExp2('#171c22', .019);
        this.camera = new T.PerspectiveCamera(68, innerWidth / innerHeight, .08, 160);
        this.camera.rotation.order = 'YXZ';
        this.scene.add(new T.HemisphereLight(0xc8dfeb, 0x171519, 2.1));
        this.light = new T.DirectionalLight(0xffd8a0, 3);
        this.light.position.set(-8, 18, 5);
        this.scene.add(this.light);
        const fill = new T.PointLight(0xa8d5df, 35, 30);
        fill.position.set(0, 6, -8);
        this.scene.add(fill);
        this.root = new T.Group();
        this.scene.add(this.root);
        this.build();
        this.relics = new Relics(this.root);
        this.effects = new WitnessVisuals(this);
        for (const material of this.materials) {
            material.bumpMap = this.relics.eden.bumpMap;
            material.bumpScale = .025;
            material.needsUpdate = true;
        }
        addEventListener('resize', () => { this.renderer.setSize(innerWidth, innerHeight); this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); });
    }
    mat(color, metalness = 0, emissive) { return new T.MeshStandardMaterial({ color, roughness: .77, metalness, emissive: emissive || '#000000', emissiveIntensity: .5 }); }
    mesh(geo, mat, x = 0, y = 0, z = 0, parent = this.root) { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; }
    box(x, y, z, sx, sy, sz, mat, parent = this.root) { return this.mesh(new T.BoxGeometry(sx, sy, sz), mat, x, y, z, parent); }
    ring(radius, tube, mat, x, y, z, parent = this.root) { return this.mesh(new T.TorusGeometry(radius, tube, 10, 64), mat, x, y, z, parent); }
    build() {
        const stone = this.mat('#8a8981'), dark = this.mat('#525954'), gold = this.mat('#9c8052', .65), white = this.mat('#d8d4c2'), black = this.mat('#141f20'), green = this.mat('#374a3b'), glow = this.mat('#d4dbbf', .2, '#b9d7b5');
        this.materials.push(stone);
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = textureCanvas.height = 256;
        const ctx = textureCanvas.getContext('2d');
        ctx.fillStyle = '#b9b7ad';
        ctx.fillRect(0, 0, 256, 256);
        let seed = 42;
        for (let i = 0; i < 14000; i++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const x = seed % 256;
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const y = seed % 256;
            ctx.fillStyle = i % 3 ? '#aaa99f33' : '#f2e8ce22';
            ctx.fillRect(x, y, 2, 1);
        }
        ctx.strokeStyle = '#75766e55';
        ctx.lineWidth = 2;
        for (let y = 0; y < 256; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y);
            ctx.stroke();
        }
        stone.map = new T.CanvasTexture(textureCanvas);
        stone.map.wrapS = stone.map.wrapT = T.RepeatWrapping;
        stone.map.repeat.set(2, 4);
        const pavement = new T.Group();
        this.root.add(pavement);
        this.box(0, -.25, 0, 28, .5, 36, stone, pavement);
        for (let x = -12; x <= 12; x += 2)
            for (let z = -16; z <= 16; z += 2)
                this.box(x, .006, z, 1.94, .015, 1.94, (x + z) % 4 === 0 ? stone : dark, pavement);
        batch(pavement);
        // Broken side walls retain large, visible passages at the transept.
        for (const x of [-13, 13])
            for (const z of [-10, 10])
                this.box(x, 6, z, .7, 12, 12, stone);
        for (const z of [-18, 18])
            for (const x of [-9, 9])
                this.box(x, 7, z, 10, 14, .8, stone);
        const pierMats = [stone, dark, gold].map(m => { const c = m.clone(); c.transparent = true; this.columnMats.push(c); return c; });
        this.materials.push(pierMats[0]);
        const pier = columnModel(...pierMats);
        for (const x of [-7, 7])
            for (const z of [-10, 0, 10]) {
                const column = pier.clone(true);
                column.position.set(x, 0, z);
                this.root.add(column);
            }
        const masonry = new T.Group();
        this.root.add(masonry);
        for (const z of [-10, 0, 10]) {
            archBand(masonry, stone, 6.9, 10.9, 7.1, .24, .35, z);
            archBand(masonry, gold, 6.72, 10.9, 6.92, .06, .15, z + .23);
            carvedBox(masonry, gold, 0, 18.1, z, .3, .72, .6, .04);
        }
        for (const x of [-12.55, 12.55])
            for (const z of [-10, 10])
                for (const y of [.22, 11.75])
                    carvedBox(masonry, dark, x, y, z, .45, .24, 12, .05);
        // A solid clerestory behind the tracery makes the portals read as deep openings.
        this.box(0, 9.5, -18.08, 8, 19, .36, stone).name = 'frontClerestory';
        this.box(0, 9.5, 18.08, 8, 19, .36, stone, masonry);
        for (const x of [-3.65, 3.65])
            carvedBox(masonry, dark, x, 8.5, -17.8, .25, 17, .4, .035);
        batch(masonry);
        this.ceiling = new T.Group();
        this.root.add(this.ceiling);
        for (const z of [-10, 0])
            for (const side of [-1, 1])
                tube(this.ceiling, dark, [[side * 7, 10.9, z], [side * 5, 14.5, z + 2.5], [0, 18, z + 5], [side * -5, 14.5, z + 7.5], [side * -7, 10.9, z + 10]], .12, 40, 8);
        carvedBox(this.ceiling, gold, 0, 18, 0, .18, .18, 20, .025);
        batch(this.ceiling);
        const window = windowModel(stone, gold, glow);
        for (const x of [-12.6, 12.6])
            for (const z of [-12, -6, 6, 12]) {
                const win = window.clone(true);
                win.position.set(x, 4.4, z);
                win.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                this.root.add(win);
            }
        const door = portalModel(stone, dark, gold);
        for (const [x, z, rot] of [[0, -17, 0], [-12.9, 0, Math.PI / 2], [12.9, 0, -Math.PI / 2]]) {
            const g = door.clone(true);
            g.position.set(x, 0, z);
            if (z === -17)
                g.name = 'frontDoor';
            g.rotation.y = rot;
            this.root.add(g);
        }
        // Tread dimensions and tops are shared with physical support; ornaments stay outside them.
        const stair = new T.Group();
        stair.name = 'stair';
        this.root.add(stair);
        for (const [i, step] of stairs.entries()) {
            const y = step.y, z = step.z;
            carvedBox(stair, stone, step.x, y - .15, z, step.width, .3, step.depth, .025);
            this.box(0, y - .035, z + step.depth / 2 + .002, step.width - .08, .035, .015, gold, stair);
            if (i % 3 === 0)
                for (const x of [-1.94, 1.94]) {
                    const post = lathe(stair, gold, [[.1, 0], [.1, .08], [.055, .14], [.045, .84], [.08, .9], [.045, .96], [0, 1.02]], 10);
                    post.position.set(x, y - .05, z);
                }
        }
        for (let i = 0; i < 22; i++) {
            const a = i * .18, g = new T.Group();
            g.position.set(6 + Math.cos(a) * 5, 7 + i * .23, -6 + Math.sin(a) * 5);
            g.rotation.y = -a;
            stair.add(g);
            carvedBox(g, stone, 0, 0, 0, 2, .2, 1, .025);
            this.box(0, .08, .48, 1.92, .025, .025, gold, g);
        }
        this.screen = this.box(0, 2, -2, 6, 4, .24, this.mat('#8a9f9d', .5));
        this.screen.material.transparent = true;
        this.screen.material.opacity = .28;
        this.screen.material.wireframe = true;
        batch(stair);
        this.rose = roseModel(stone, gold);
        this.rose.position.set(0, 11.8, -17.4);
        this.root.add(this.rose);
        const particles = new Float32Array(360 * 3);
        for (let i = 0; i < 360; i++) {
            particles[i * 3] = Math.sin(i * 13.7) * 12;
            particles[i * 3 + 1] = (i % 97) / 6;
            particles[i * 3 + 2] = Math.cos(i * 3.3) * 17;
        }
        const pg = new T.BufferGeometry();
        pg.setAttribute('position', new T.BufferAttribute(particles, 3));
        this.dust = new T.Points(pg, new T.PointsMaterial({ color: 0xe2d4ae, size: .035, transparent: true, opacity: .6 }));
        this.root.add(this.dust);
        this.low = new T.Group();
        this.low.position.set(10.5, 0, -11);
        this.root.add(this.low);
        const smallDoor = door.clone(true);
        smallDoor.scale.set(.35, .18, .7);
        this.low.add(smallDoor);
        this.water = this.box(0, .08, -2, 8, .12, 8, new T.MeshStandardMaterial({ color: '#507f89', metalness: .85, roughness: .15, transparent: true, opacity: .85 }));
        this.bridge = new T.Group();
        this.root.add(this.bridge);
        for (let z = -6; z <= 2; z++)
            this.box(0, .2, z, 2, .25, .8, white, this.bridge);
        this.roots = returningRoots();
        this.root.add(this.roots);
        this.burial = new T.Group();
        this.root.add(this.burial);
        const earth = this.mat('#332c29');
        this.box(0, -7.25, 0, 28, .5, 36, earth, this.burial);
        for (const x of [-7, 7])
            for (const z of [-10, 0, 10]) {
                this.mesh(new T.CylinderGeometry(.95, .7, 7, 10), earth, x, -3.5, z, this.burial);
                this.box(x, -6.8, z, 2.2, .4, 2.2, gold, this.burial);
            }
        for (const z of [-10, 0, 10])
            this.mesh(new T.TorusGeometry(7, .25, 8, 48, Math.PI), earth, 0, -7, z, this.burial);
        const burialLight = new T.PointLight(0x9f7352, 50, 28);
        burialLight.position.set(0, -4, -5);
        this.burial.add(burialLight);
        for (const z of [-13, -17]) {
            for (const x of [-3.6, 3.6])
                this.mesh(new T.CylinderGeometry(.48, .72, 5.7, 10), earth, x, -4.15, z, this.burial);
            this.mesh(new T.TorusGeometry(3.6, .18, 8, 48, Math.PI), earth, 0, -5.2, z, this.burial);
        }
        this.box(0, -3.5, -18, 14, 7, .5, earth, this.burial);
        const sepulchralLight = new T.PointLight(0xc68b62, 55, 20);
        sepulchralLight.position.set(0, -3.4, -12);
        this.burial.add(sepulchralLight);
        for (const x of [-2.7, 0, 2.7]) {
            this.box(x, -4.5, -17.72, 1.2, 3, .1, this.mat('#0b0908'), this.burial);
            this.ring(.5, .035, gold, x, -2.8, -17.6, this.burial);
        }
        this.scar = this.ring(2.5, .045, this.mat('#4f382e', .7), 0, .045, -8);
        this.scar.rotation.x = -Math.PI / 2;
        this.throne = throneModel(stone, gold, dark);
        this.root.add(this.throne);
        this.cat = catModel();
        this.root.add(this.cat);
        const angel = angelModel();
        this.angel = angel.root;
        this.wings = angel.wings;
        this.eyes = angel.eyes;
        this.pupils = angel.pupils;
        this.centralEye = angel.center;
        this.angel.position.set(0, 3.7, -8);
        this.root.add(this.angel);
        for (let i = 0; i < 7; i++) {
            const copy = this.cat.clone(true);
            copy.visible = false;
            this.root.add(copy);
            this.copies.push(copy);
        }
        const bushes = gardenModel();
        bushes.name = 'bushes';
        this.root.add(bushes);
        const tableStone = this.mat('#263936', .3), pedestal = tableModel(tableStone, gold);
        pedestal.position.set(-3.7, 0, 8);
        this.root.add(pedestal);
        this.table = carvedBox(this.root, this.mat('#718b76', .4, '#617b51'), -3.7, .95, 8, 1.7, .16, 1.7, .025);
        const pieces = new T.Group();
        this.root.add(pieces);
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                carvedBox(pieces, (i + j) % 2 ? gold : dark, -4.25 + i * .36, 1.05, 7.45 + j * .36, .25, .04, .25, .014);
        batch(pieces);
        this.letter = this.box(-4, 1, -6, .7, .02, 1, white);
        for (const w of witnesses)
            this.figures[w.id] = discipleModel(w.id);
        for (let i = 0; i < 3; i++) {
            const g = new T.Group();
            this.root.add(g);
            this.companions.push(g);
        }
    }
    gazeDirection(w) { this.camera.rotation.set(w.pitch, w.yaw, 0); const d = new T.Vector3(); this.camera.getWorldDirection(d); return { x: d.x, y: d.y, z: d.z }; }
    waitTarget(w) { return gazeLanding(w, this.gazeDirection(w), Math.max(.85, this.camera.position.y - w.y)); }
    target(w) {
        const none = { target: 'none', targetId: '' };
        if (w.underworld > 0)
            return none;
        const d = this.gazeDirection(w), dir = new T.Vector3(d.x, d.y, d.z), origin = new T.Vector3(w.x, w.y + (manifestation(w, 'alphaeus') ? .68 : w.passage && w.x > 8 && w.z < -8 ? .85 : 1.7), w.z);
        const targets = [['cat', 'cat', this.cat.position.clone().add(new T.Vector3(0, .77, -.12)), 6], ['angel', 'angel', this.angel.position, 20], ['stone', 'stone', new T.Vector3(0, w.place === 'crypt' ? 2.5 : 2, w.place === 'crypt' ? -9 : -2), 12], ['threshold', 'front', new T.Vector3(0, w.place === 'stair' ? 11 : 3, -17), 22], ['threshold', 'left', new T.Vector3(-12, 2, 0), 14], ['threshold', 'right', new T.Vector3(12, 2, 0), 14]];
        if (witnessVisual(w, 'andrew'))
            catCopies(w).forEach((p, i) => targets.push(['cat', 'cat-copy-' + i, new T.Vector3(p.x, .72, p.z), 18]));
        let chosen = none, best = .93;
        for (const [kind, id, p, max] of targets) {
            if (kind === 'angel' && (w.place !== 'garden' || w.angel < .25))
                continue;
            if (kind === 'stone' && (w.place !== 'nave' && w.place !== 'crypt' || w.place === 'nave' && (w.stable || w.skin) || w.place === 'crypt' && !throneVisible(w)))
                continue;
            if (kind === 'cat' && id === 'cat' && !this.cat.visible)
                continue;
            const delta = p.clone().sub(origin), distance = delta.length(), dot = dir.dot(delta.normalize());
            if (distance > max || dot < best)
                continue;
            let blocked = false;
            for (let t = .4; t < distance - .8; t += .35) {
                const point = origin.clone().addScaledVector(delta, t);
                for (const px of [-7, 7])
                    for (const pz of [-10, 0, 10])
                        if (point.y < 11 && Math.hypot(point.x - px, point.z - pz) < .7)
                            blocked = true;
            }
            if (blocked)
                continue;
            best = dot;
            chosen = { target: kind, targetId: w.place + ':' + id };
        }
        return chosen;
    }
    draw(w, dt, reduced) {
        this.relics.update(w);
        this.clock += dt;
        const t = this.clock;
        const stair = w.place === 'stair';
        this.root.getObjectByName('stair').visible = stair;
        this.root.getObjectByName('frontDoor').position.y = stair ? 8.1 : 0;
        this.rose.position.y = (stair ? 20.2 : 11.8) + (w.ceiling ? 1.05 : 0);
        const clerestory = this.root.getObjectByName('frontClerestory');
        clerestory.scale.y = stair ? 26 / 19 : 1;
        clerestory.position.y = stair ? 13 : 9.5;
        this.root.getObjectByName('bushes').visible = w.place === 'garden';
        const height = w.y;
        const depth = w.underworld > 0 ? 6.4 * Math.min(1, (9 - w.underworld) / 1.2, w.underworld / 2) : 0;
        this.burial.visible = depth > 0;
        this.scar.visible = w.buried && (w.place === 'garden' || w.place === 'crypt');
        const lowHeight = manifestation(w, 'alphaeus') ? witnessBodyHeight(w) : w.passage && w.x > 8 && w.z < -8 ? .85 : 1.7;
        this.camera.position.set(w.x, lowHeight + height - (reduced && depth > 0 ? 6.4 : depth), w.z);
        this.camera.rotation.set(w.pitch, w.yaw, 0);
        this.water.visible = w.place === 'water' || w.memory > 2;
        this.water.position.y = w.place === 'water' ? (witnessVisual(w, 'matthew') ? 12 : .08) : 13 + Math.sin(t * .1) * .2;
        this.rose.rotation.z = (reduced ? 0 : t * .008) * (1 + w.memory * .1);
        this.rose.scale.setScalar(w.ceiling ? 1.3 : 1);
        this.dust.rotation.y = reduced ? 0 : Math.sin(t * .03) * .15;
        this.dust.material.opacity = .2 + w.attention * .025;
        this.bridge.visible = w.place === 'water' && w.bridge;
        this.screen.visible = w.place === 'nave' && !w.skin && !w.stable;
        this.roots.visible = w.roots || w.place === 'garden';
        this.ceiling.visible = !w.ceiling;
        this.throne.visible = w.place === 'crypt' && throneVisible(w);
        this.low.scale.y = witnessVisual(w, 'alphaeus') ? 1.8 : 1;
        this.low.visible = w.passage && w.place === 'nave';
        this.letter.visible = w.place === 'crypt';
        this.angel.visible = w.place === 'garden' && w.angel > .12;
        this.angel.scale.setScalar(Math.max(.01, w.angel));
        this.angel.position.y = (w.underworld > 0 ? -1 : 3.7) + (reduced ? 0 : Math.sin(t * .3) * .3);
        this.angel.rotation.x = w.underworld > 0 ? Math.PI : 0;
        this.eyes.scale.y = this.pupils.scale.y = w.underworld > 0 ? .04 : witnessVisual(w, 'john') ? .08 : 1;
        this.eyes.rotation.y = this.pupils.rotation.y = reduced ? 0 : t * .055;
        this.wings.rotation.z = reduced ? 0 : Math.sin(t * .12) * .12;
        this.centralEye.scale.y = this.eyes.scale.y;
        const color = ['#171e26', '#25202d', '#19312c'][w.reality];
        this.scene.background.set(depth > 0 ? '#0a0706' : color);
        this.scene.fog.color.set(depth > 0 ? '#0a0706' : color);
        this.scene.fog.density = depth > 0 ? .048 : .019;
        this.light.color.set(w.place === 'garden' ? '#d2e1b0' : w.place === 'crypt' ? '#baa3d2' : '#ffe1b2');
        let cx = 5, cz = -5;
        if (w.catPhase === 2) {
            cx = 5 + Math.min(1, w.catTimer / 3) * 5;
            cz = -5 - Math.min(1, w.catTimer / 3) * 6;
        }
        else if (w.catPhase === 3) {
            cx = 10;
            cz = -11;
        }
        if (w.place !== 'nave') {
            cx = w.x + Math.sin(t * .2) * 2;
            cz = w.z - 3;
        }
        this.cat.position.lerp(new T.Vector3(cx, .03, cz), Math.min(1, dt * 2));
        this.cat.rotation.y = Math.atan2(cx - this.cat.position.x, cz - this.cat.position.z);
        this.cat.visible = w.catPhase !== 3 || w.place !== 'nave';
        this.companions.forEach((g, i) => {
            const id = w.party[i], waiting = w.waitSpots[id];
            g.visible = !!id && (!w.left.includes(id) || waiting?.place === w.place);
            if (!g.visible)
                return;
            if (g.userData.witness !== id) {
                g.clear();
                g.add(this.figures[id].clone(true));
                g.userData.witness = id;
            }
            let point;
            if (waiting) {
                point = waiting;
            }
            else {
                const a = w.yaw + (i - 1) * .9, x = Math.max(-11, Math.min(11, w.x + Math.sin(a) * 2)), z = Math.max(-15, Math.min(15, w.z + Math.cos(a) * 2));
                point = { x, z, y: groundAt(w, x, z, w.y + .32) };
            }
            if (this.lastPlace !== w.place || Math.hypot(g.position.x - point.x, g.position.z - point.z) > 16)
                g.position.set(point.x, point.y, point.z);
            else {
                g.position.x += (point.x - g.position.x) * Math.min(1, dt * 3);
                g.position.z += (point.z - g.position.z) * Math.min(1, dt * 3);
                const onThrone = waiting?.enthroned && Math.hypot(g.position.x - point.x, g.position.z - point.z) < 1;
                const floor = onThrone ? point.y : groundAt(w, g.position.x, g.position.z, g.position.y + .32);
                if (floor >= g.position.y) {
                    g.position.y = floor;
                    g.userData.vy = 0;
                }
                else {
                    g.userData.vy = (g.userData.vy || 0) - 14 * dt;
                    g.position.y = Math.max(floor, g.position.y + g.userData.vy * dt);
                }
            }
            g.rotation.y = waiting?.enthroned ? Math.PI : w.yaw;
        });
        this.lastPlace = w.place;
        const copies = catCopies(w);
        this.copies.forEach((copy, i) => { copy.visible = !!witnessVisual(w, 'andrew'); if (copy.visible) {
            copy.position.set(copies[i].x, .03, copies[i].z);
            copy.rotation.y = i * .9;
        } });
        this.effects.update(w, reduced);
        this.renderer.render(this.scene, this.camera);
    }
}
