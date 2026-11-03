import { WitnessVisuals } from './witness-visuals.js';
import { manifestation, witnessVisual, witnessBodyHeight, catCopies } from './witnesses.js';
import { returningRoots } from './roots.js';
import { stairs, groundAt, gazeLanding } from './space.js';
import { Relics } from './relics.js';
import * as T from '../three.module.js';
import { throneVisible } from './world.js';
export class Cathedral {
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
        this.box(0, -.25, 0, 28, .5, 36, stone);
        for (let x = -12; x <= 12; x += 2)
            for (let z = -16; z <= 16; z += 2)
                this.box(x, .006, z, 1.94, .015, 1.94, (x + z) % 4 === 0 ? stone : dark);
        // Broken side walls retain large, visible passages at the transept.
        for (const x of [-13, 13])
            for (const z of [-10, 10])
                this.box(x, 6, z, .7, 12, 12, stone);
        for (const z of [-18, 18])
            for (const x of [-9, 9])
                this.box(x, 7, z, 10, 14, .8, stone);
        for (const x of [-7, 7])
            for (const z of [-10, 0, 10]) {
                const columnMat = stone.clone();
                columnMat.transparent = true;
                this.columnMats.push(columnMat);
                this.mesh(new T.CylinderGeometry(.62, .84, 11, 12), columnMat, x, 5.5, z);
                this.box(x, .2, z, 2, .4, 2, dark);
                this.box(x, 10.6, z, 1.8, .7, 1.8, gold);
                for (const offset of [-.32, .32])
                    this.mesh(new T.CylinderGeometry(.12, .12, 11, 8), white, x + offset, 5.5, z + .48);
            }
        for (const z of [-10, 0, 10]) {
            const arch = this.mesh(new T.TorusGeometry(7, .22, 10, 64, Math.PI), stone, 0, 10.4, z);
            arch.scale.y = 1.15;
            this.box(0, 17.9, z, .16, .8, .5, gold);
        }
        this.ceiling = new T.Group();
        this.root.add(this.ceiling);
        for (let z = -16; z < 18; z += 4) {
            const beam = this.box(0, 17, z, 25, .3, .24, dark, this.ceiling);
            beam.rotation.z = .04;
        }
        for (const x of [-12.7, 12.7])
            for (const z of [-12, -6, 6, 12]) {
                const win = this.box(x, 7, z, .06, 5, 1.4, glow);
                this.ring(.7, .07, gold, x, 9.5, z).rotation.y = Math.PI / 2;
            }
        for (const [x, z, rot] of [[0, -17, 0], [-12.9, 0, Math.PI / 2], [12.9, 0, Math.PI / 2]]) {
            const g = new T.Group();
            g.position.set(x, 0, z);
            if (z === -17)
                g.name = 'frontDoor';
            g.rotation.y = rot;
            this.root.add(g);
            this.box(-2.5, 3, 0, .55, 6, .7, gold, g);
            this.box(2.5, 3, 0, .55, 6, .7, gold, g);
            this.ring(2.5, .28, gold, 0, 5.8, 0, g);
            this.box(0, 3, -.3, 4.5, 6, .2, this.mat('#090e15', 0, '#162029'), g);
        }
        // A stair climbs into its own displaced return, while the usable surface is continuous.
        const stair = new T.Group();
        stair.name = 'stair';
        this.root.add(stair);
        for (const step of stairs) {
            const y = step.y, z = step.z;
            this.box(step.x, y - .15, z, step.width, .3, step.depth, stone, stair);
            for (const x of [-2.3, 2.3])
                this.box(x, y + .65, z, .09, 1.4, .09, gold, stair);
        }
        for (let i = 0; i < 22; i++) {
            const a = i * .18;
            this.box(6 + Math.cos(a) * 5, 7 + i * .23, -6 + Math.sin(a) * 5, 2, .2, 1, stone, stair).rotation.y = -a;
        }
        this.screen = this.box(0, 2, -2, 6, 4, .24, this.mat('#8a9f9d', .5));
        this.screen.material.transparent = true;
        this.screen.material.opacity = .28;
        this.screen.material.wireframe = true;
        this.rose = new T.Group();
        this.rose.position.set(0, 11, -17.4);
        this.root.add(this.rose);
        for (let i = 0; i < 6; i++)
            this.ring(1.4 + i * .32, .035, gold, 0, 0, 0, this.rose);
        for (let i = 0; i < 24; i++) {
            const a = i * Math.PI / 12;
            const petal = this.mesh(new T.CircleGeometry(.55, 3), this.mat(i % 2 ? '#658b88' : '#b2936b', .3, i % 2 ? '#264b4c' : '#62432b'), Math.cos(a) * 2.1, Math.sin(a) * 2.1, .05, this.rose);
            petal.rotation.z = a;
            this.box(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0, .04, 2.4, .06, gold, this.rose).rotation.z = a - Math.PI / 2;
        }
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
        this.box(0, .7, 0, 2, 1.4, .3, black, this.low);
        this.ring(1, .12, gold, 0, .4, .1, this.low);
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
        this.throne = new T.Group();
        this.root.add(this.throne);
        this.box(0, .7, -9, 3, 1.4, 2, gold, this.throne);
        this.box(0, 2.5, -10, 3, 4, .4, gold, this.throne);
        for (const x of [-1.5, 1.5])
            this.box(x, 1.6, -9, .3, 2, 2, dark, this.throne);
        this.cat = new T.Group();
        this.root.add(this.cat);
        this.mesh(new T.SphereGeometry(.32, 16, 12), white, 0, .4, 0, this.cat).scale.set(.8, 1, 1.4);
        this.mesh(new T.SphereGeometry(.24, 16, 12), white, 0, .72, -.24, this.cat);
        const orange = this.mat('#ad643b');
        for (const x of [-.15, .15]) {
            const ear = this.mesh(new T.ConeGeometry(.11, .23, 3), x < 0 ? black : orange, x, .98, -.22, this.cat);
            ear.rotation.z = x * 1.5;
            this.mesh(new T.SphereGeometry(.055, 10, 8), glow, x * .7, .77, -.45, this.cat);
            this.box(x, .13, -.1, .1, .25, .15, white, this.cat);
        }
        this.mesh(new T.SphereGeometry(.23, 12, 10), orange, .16, .47, .04, this.cat).scale.set(.6, 1, 1.3);
        const tail = this.mesh(new T.TorusGeometry(.3, .055, 8, 16, Math.PI * 1.4), black, .1, .45, .45, this.cat);
        tail.rotation.y = 1;
        this.angel = new T.Group();
        this.angel.position.set(0, 3.7, -8);
        this.root.add(this.angel);
        this.wings = new T.Group();
        this.angel.add(this.wings);
        for (let i = 0; i < 6; i++) {
            const g = new T.Group();
            g.rotation.z = i * Math.PI / 3;
            this.wings.add(g);
            for (let j = 0; j < 14; j++) {
                const feather = this.mesh(new T.ConeGeometry(.18, 3.2 - j * .12, 5), white, 1 + j * .16, 0, j * .025, g);
                feather.rotation.z = -Math.PI / 2 + .3;
            }
        }
        for (let i = 0; i < 3; i++) {
            const ring = this.ring(1.4 + i * .58, .07, gold, 0, 0, 0, this.angel);
            ring.rotation.x = i * .8;
            ring.rotation.y = i * .7;
        }
        const eyeGeo = new T.SphereGeometry(.07, 6, 4);
        this.eyes = new T.InstancedMesh(eyeGeo, glow, 1000);
        const pupil = new T.InstancedMesh(new T.SphereGeometry(.031, 5, 4), black, 1000);
        const dummy = new T.Object3D();
        for (let i = 0; i < 1000; i++) {
            const a = i * 2.399, y = 1 - 2 * i / 1000, r = Math.sqrt(1 - y * y), rad = 1.3 + (i % 3) * .55;
            dummy.position.set(Math.cos(a) * r * rad, y * rad, Math.sin(a) * r * rad);
            dummy.lookAt(dummy.position.clone().multiplyScalar(2));
            dummy.scale.set(1.5, .85, .6);
            dummy.updateMatrix();
            this.eyes.setMatrixAt(i, dummy.matrix);
            dummy.position.multiplyScalar(1.025);
            dummy.updateMatrix();
            pupil.setMatrixAt(i, dummy.matrix);
        }
        this.pupils = pupil;
        this.angel.add(this.eyes, pupil);
        for (let i = 0; i < 7; i++) {
            const copy = this.cat.clone(true);
            copy.visible = false;
            this.root.add(copy);
            this.copies.push(copy);
        }
        const bushes = new T.Group();
        bushes.name = 'bushes';
        this.root.add(bushes);
        for (let i = 0; i < 35; i++) {
            const a = i * 2.399, r = Math.sqrt(i) * .6;
            this.mesh(new T.IcosahedronGeometry(.7 + (i % 3) * .15, 0), green, Math.sin(a) * r, .4, Math.cos(a) * r - 8, bushes);
        }
        const tableStone = this.mat('#263936', .3);
        this.box(-3.7, .45, 8, .7, .9, .7, tableStone);
        this.table = this.box(-3.7, .95, 8, 1.7, .16, 1.7, this.mat('#718b76', .4, '#617b51'));
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                this.box(-4.25 + i * .36, 1.04, 7.45 + j * .36, .25, .025, .25, (i + j) % 2 ? gold : dark);
        this.letter = this.box(-4, 1, -6, .7, .02, 1, white);
        for (let i = 0; i < 3; i++) {
            const g = new T.Group();
            this.root.add(g);
            this.mesh(new T.CylinderGeometry(.23, .38, 1.25, 8), dark, 0, .85, 0, g);
            this.mesh(new T.SphereGeometry(.2, 12, 8), white, 0, 1.65, 0, g);
            this.box(.08, 1.1, -.24, .04, .9, .08, glow, g);
            for (const x of [-.35, .35])
                this.mesh(new T.CylinderGeometry(.055, .07, .8, 6), gold, x, .9, 0, g);
            for (const fx of [-.13, .13]) {
                this.box(fx, .16, 0, .12, .32, .12, dark, g);
                this.box(fx, .055, -.06, .16, .11, .25, gold, g);
            }
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
        const targets = [['cat', 'cat', this.cat.position, 6], ['angel', 'angel', this.angel.position, 20], ['stone', 'stone', new T.Vector3(0, w.place === 'crypt' ? 2.5 : 2, w.place === 'crypt' ? -9 : -2), 12], ['threshold', 'front', new T.Vector3(0, w.place === 'stair' ? 11 : 3, -17), 22], ['threshold', 'left', new T.Vector3(-12, 2, 0), 14], ['threshold', 'right', new T.Vector3(12, 2, 0), 14]];
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
        this.rose.position.y = stair ? 16 : 11;
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
