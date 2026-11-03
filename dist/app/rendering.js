import { Relics } from './relics.js';
import * as T from '../three.module.js';
import { present } from './world.js';
export class Cathedral {
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
                this.mesh(new T.CylinderGeometry(.62, .84, 11, 12), stone, x, 5.5, z);
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
        for (let i = 0; i < 36; i++) {
            const y = i * .23, z = -i * .7 + 8;
            this.box(0, y - .15, z, 4, .3, .72, stone, stair);
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
        this.roots = new T.Group();
        this.root.add(this.roots);
        for (let i = 0; i < 65; i++) {
            const a = i * 2.399, r = 3 + Math.sqrt(i) * 1.05;
            const root = this.mesh(new T.CylinderGeometry(.025, .17, 2 + (i % 5), 6), green, Math.sin(a) * r, .5, Math.cos(a) * r, this.roots);
            root.rotation.z = Math.sin(i) * 1.4;
        }
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
        this.angel.add(this.eyes, pupil);
        const bushes = new T.Group();
        bushes.name = 'bushes';
        this.root.add(bushes);
        for (let i = 0; i < 35; i++) {
            const a = i * 2.399, r = Math.sqrt(i) * .6;
            this.mesh(new T.IcosahedronGeometry(.7 + (i % 3) * .15, 0), green, Math.sin(a) * r, .4, Math.cos(a) * r - 8, bushes);
        }
        this.letter = this.box(-4, 1, -6, .7, .02, 1, white);
        for (let i = 0; i < 3; i++) {
            const g = new T.Group();
            this.root.add(g);
            this.mesh(new T.CylinderGeometry(.23, .38, 1.25, 8), dark, 0, .85, 0, g);
            this.mesh(new T.SphereGeometry(.2, 12, 8), white, 0, 1.65, 0, g);
            this.box(.08, 1.1, -.24, .04, .9, .08, glow, g);
            for (const x of [-.35, .35])
                this.mesh(new T.CylinderGeometry(.055, .07, .8, 6), gold, x, .9, 0, g);
            this.companions.push(g);
        }
    }
    target(w) {
        const dir = new T.Vector3();
        this.camera.getWorldDirection(dir);
        const targets = [['cat', this.cat.position, 6], ['angel', this.angel.position, 20], ['stone', new T.Vector3(0, 2, -2), 12], ['threshold', new T.Vector3(0, 3, -17), 22], ['threshold', new T.Vector3(-12, 2, 0), 14], ['threshold', new T.Vector3(12, 2, 0), 14]];
        for (const [name, p, max] of targets) {
            if (name === 'angel' && w.place !== 'garden')
                continue;
            if (name === 'stone' && w.place !== 'nave' && w.place !== 'crypt')
                continue;
            if (name === 'cat' && !this.cat.visible)
                continue;
            const delta = p.clone().sub(this.camera.position);
            if (delta.length() < max && dir.dot(delta.normalize()) > .87)
                return name;
        }
        return 'none';
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
        const height = stair ? Math.max(0, (8 - w.z) * .328) : 0;
        const lowHeight = w.passage && w.x > 8 && w.z < -8 && !present(w, 'alphaeus') ? .85 : 1.7;
        this.camera.position.set(w.x, lowHeight + height, w.z);
        this.camera.rotation.set(w.pitch, w.yaw, 0);
        this.water.visible = w.place === 'water' || w.memory > 2;
        this.water.position.y = w.place === 'water' ? (present(w, 'matthew') && w.bridge ? 12 : .08) : 13 + Math.sin(t * .1) * .2;
        this.rose.rotation.z = (reduced ? 0 : t * .008) * (1 + w.memory * .1);
        this.rose.scale.setScalar(w.ceiling ? 1.3 : 1);
        this.dust.rotation.y = reduced ? 0 : Math.sin(t * .03) * .15;
        this.dust.material.opacity = .2 + w.attention * .025;
        this.bridge.visible = w.place === 'water' && w.bridge;
        this.screen.visible = w.place === 'nave' && !w.skin && !w.stable;
        this.roots.visible = w.roots || w.place === 'garden';
        this.ceiling.visible = !w.ceiling;
        this.throne.visible = w.place === 'crypt' && w.throne;
        this.low.scale.y = present(w, 'alphaeus') ? 1.8 : 1;
        this.low.visible = w.passage && w.place === 'nave';
        this.letter.visible = w.place === 'crypt';
        this.angel.visible = w.place === 'garden' && w.angel > .12;
        this.angel.scale.setScalar(Math.max(.01, w.angel));
        this.angel.position.y = 3.7 + (reduced ? 0 : Math.sin(t * .3) * .3);
        this.eyes.scale.y = present(w, 'john') ? .12 : 1;
        this.eyes.rotation.y = reduced ? 0 : t * .055;
        this.wings.rotation.z = reduced ? 0 : Math.sin(t * .12) * .12;
        const color = ['#171e26', '#25202d', '#19312c'][w.reality];
        this.scene.background.set(color);
        this.scene.fog.color.set(color);
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
        this.companions.forEach((g, i) => { g.visible = !!w.party[i] && (!w.left.includes(w.party[i]) || w.waiting[w.party[i]] === w.place); if (w.left.includes(w.party[i])) {
            g.position.lerp(new T.Vector3(-6 + i * 3, 0, 10), dt * 2);
        }
        else {
            const a = w.yaw + (i - 1) * .9;
            g.position.lerp(new T.Vector3(w.x + Math.sin(a) * 2.4, height, w.z + Math.cos(a) * 2.4), Math.min(1, dt * 2));
        } g.rotation.y = w.yaw; });
        this.renderer.render(this.scene, this.camera);
    }
}
