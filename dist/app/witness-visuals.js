import * as T from '../three.module.js';
import { witnesses } from './content.js';
import { witnessEffects, witnessVisual, manifestation } from './witnesses.js';
export class WitnessVisuals {
    view;
    groups;
    veil;
    slab;
    rootArc;
    constructor(view) {
        this.view = view;
        this.groups = {};
        for (const { id } of witnesses) {
            const g = new T.Group();
            g.visible = false;
            view.root.add(g);
            this.groups[id] = g;
            const mat = new T.MeshBasicMaterial({ color: witnessEffects[id].color, transparent: true, opacity: .5, depthWrite: false });
            if (id === 'peter') {
                for (const [x, y, z, rot] of [[0, 4, -16.8, 0], [-12.7, 3, 0, Math.PI / 2], [12.7, 3, 0, Math.PI / 2]]) {
                    const ring = new T.Mesh(new T.TorusGeometry(2.4, .055, 6, 64), mat);
                    ring.position.set(x, y, z);
                    ring.rotation.y = rot;
                    g.add(ring);
                }
            }
            else if (id === 'thomas') {
                this.slab = new T.Mesh(new T.BoxGeometry(4, .23, 4), new T.MeshStandardMaterial({ color: '#a8c9d3', metalness: .6, roughness: .25, transparent: true, opacity: .75 }));
                g.add(this.slab);
                const wire = new T.LineSegments(new T.EdgesGeometry(this.slab.geometry), new T.LineBasicMaterial({ color: '#d0eaff' }));
                this.slab.add(wire);
            }
            else if (id === 'jude') {
                this.rootArc = new T.Mesh(new T.TorusGeometry(2.5, .28, 8, 48, Math.PI), new T.MeshStandardMaterial({ color: '#537b50', roughness: .9 }));
                this.rootArc.rotation.x = -Math.PI / 2;
                this.rootArc.position.y = .25;
                g.add(this.rootArc);
            }
            else if (id === 'simon') {
                for (let i = 0; i < 13; i++) {
                    const m = new T.Mesh(new T.BoxGeometry(.25, .25, .25), mat);
                    m.position.set(Math.cos(i * 2.4) * 2.5, 1 + i * .24, -9 + Math.sin(i * 2.4) * 2);
                    g.add(m);
                }
            }
            else if (id === 'andrew') {
                for (let i = 0; i < 7; i++) {
                    const m = new T.Mesh(new T.TorusGeometry(.7, .025, 6, 40), mat);
                    m.rotation.x = -Math.PI / 2;
                    m.position.set(Math.cos(i * Math.PI * 2 / 7) * 5, .04, -2 + Math.sin(i * Math.PI * 2 / 7) * 5);
                    g.add(m);
                }
            }
            else if (id === 'james') {
                for (let i = 0; i < 9; i++) {
                    const m = new T.Mesh(new T.CylinderGeometry(.018, .018, 12, 4), mat);
                    m.position.set(Math.sin(i * 2.4) * 4, 6, Math.cos(i * 2.4) * 4);
                    g.add(m);
                }
            }
            else if (id === 'philip') {
                for (const x of [-12.5, 0, 12.5])
                    for (let i = 0; i < 3; i++) {
                        const m = new T.Mesh(new T.TorusGeometry(2 + i * .12, .028, 6, 48), mat.clone());
                        m.material.color.set(['#dcb18b', '#93c9be', '#b5a8e3'][i]);
                        m.position.set(x + i * .15, 3, x === 0 ? -16.7 : 0);
                        m.rotation.y = x === 0 ? 0 : Math.PI / 2;
                        g.add(m);
                    }
            }
            else if (id === 'matthew') {
                for (let i = 0; i < 12; i++) {
                    const m = new T.Mesh(new T.TorusGeometry(.18, .022, 6, 20), mat);
                    m.position.set(Math.sin(i * 2.4) * 3, 11.7, -2 + Math.cos(i * 2.4) * 3);
                    g.add(m);
                }
            }
            else if (id === 'judas') {
                for (let i = 0; i < 7; i++) {
                    const m = new T.Mesh(new T.CircleGeometry(.11, 16), mat);
                    m.rotation.x = -Math.PI / 2;
                    m.position.set((i % 2) * .38, .025, -i * .4);
                    g.add(m);
                }
            }
        }
        const amounts = new Float32Array(12), colors = witnesses.map(w => new T.Color(witnessEffects[w.id].color));
        const material = new T.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, uniforms: { amounts: { value: amounts }, colors: { value: colors }, time: { value: 0 } }, vertexShader: 'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader: `precision mediump float;varying vec2 uv0;uniform float amounts[12];uniform vec3 colors[12];uniform float time;
   void main(){vec2 p=uv0-.5;float r=length(p);vec3 c=vec3(0.);float opacity=0.;for(int i=0;i<12;i++){float pattern=.25;
    if(i==0)pattern=smoothstep(.3,.7,max(abs(p.x),abs(p.y))*2.);
    if(i==1)pattern=.3+.3*sin(p.y*35.+time*.7);
    if(i==2)pattern=.2+.5*pow(abs(sin(p.x*19.)),8.);
    if(i==3)pattern=smoothstep(.15,.68,abs(p.y)*1.6);
    if(i==4)pattern=.3+.3*sin((p.x+p.y)*10.+time*.2);
    if(i==5)pattern=.25+.25*sin(p.x*130.)*sin(p.y*90.);
    if(i==6)pattern=smoothstep(-.1,.5,p.y);
    if(i==7)pattern=.2+.2*step(.95,sin(p.x*80.)+sin(p.y*80.));
    if(i==8)pattern=smoothstep(.12,.65,r);
    if(i==9)pattern=.2+.3*sin(r*38.-time*.3);
    if(i==10)pattern=.2+.3*pow(abs(sin(atan(p.y,p.x)*6.)),6.);
    if(i==11)pattern=.2+.35*smoothstep(.05,.08,abs(p.x));
    float a=amounts[i]*pattern*.16;c+=colors[i]*a;opacity+=a;}
    gl_FragColor=vec4(c/max(.001,opacity),min(.29,opacity));}` });
        this.veil = new T.Mesh(new T.PlaneGeometry(2, 2), material);
        this.veil.frustumCulled = false;
        this.veil.renderOrder = 10000;
        view.scene.add(this.veil);
    }
    update(w, reduced) {
        const view = this.view, time = reduced ? 0 : w.time, amounts = this.veil.material.uniforms.amounts.value;
        witnesses.forEach(({ id }, i) => {
            const m = witnessVisual(w, id), g = this.groups[id];
            g.visible = !!m;
            amounts[i] = m ? Math.min(1, (witnessEffects[id].duration - m.visual) / .65, m.visual / 1.4) : 0;
            if (!m)
                return;
            if (id === 'thomas')
                g.position.set(m.x, m.y - .115, m.z);
            if (id === 'jude' || id === 'james' || id === 'judas')
                g.position.set(m.x, m.y, m.z);
            if (id === 'simon')
                g.children.forEach((c, j) => { c.rotation.set(time * .1 + j, time * .13, 0); });
            if (id === 'matthew')
                g.children.forEach((c, j) => c.rotation.y = time * .3 + j);
        });
        this.veil.material.uniforms.time.value = time;
        // A fading visual may outlive collision, deliberately; phase clocks are independent.
        for (const mat of view.columnMats) {
            mat.opacity = witnessVisual(w, 'bartholomew') ? .22 : 1;
            mat.wireframe = !!witnessVisual(w, 'bartholomew');
        }
        const fov = witnessVisual(w, 'alphaeus') ? 88 : 68;
        if (view.camera.fov !== fov) {
            view.camera.fov = fov;
            view.camera.updateProjectionMatrix();
        }
        view.water.material.color.set(witnessVisual(w, 'matthew') ? '#bca46c' : witnessVisual(w, 'andrew') ? '#7ac9c3' : '#507f89');
        // The slab remains perceptible for its full physical lifetime, including a late action gate.
        const ledge = manifestation(w, 'thomas');
        if (ledge) {
            this.groups.thomas.visible = true;
            this.groups.thomas.position.set(ledge.x, ledge.y - .115, ledge.z);
        }
        const roots = manifestation(w, 'jude');
        if (roots) {
            this.groups.jude.visible = true;
            this.groups.jude.position.set(roots.x, roots.y, roots.z);
        }
    }
}
