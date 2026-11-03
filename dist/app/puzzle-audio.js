export class PuzzleAudio {
    channel;
    nodes = [];
    seed = 1407;
    constructor(channel) {
        this.channel = channel;
    }
    rustle(pan) {
        const ctx = this.channel.ctx;
        if (!ctx)
            return;
        const length = 1.7, buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate), data = buffer.getChannelData(0);
        let low = 0;
        for (let i = 0; i < data.length; i++) {
            this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
            const noise = this.seed / 4294967296 * 2 - 1;
            low = low * .86 + noise * .14;
            const t = i / ctx.sampleRate;
            data[i] = (noise - low) * Math.sin(Math.PI * t / length) ** 2 * (.45 + .55 * Math.sin(t * 31) ** 2);
        }
        const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain(), stereo = ctx.createStereoPanner();
        source.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.value = 1900;
        filter.Q.value = .65;
        gain.gain.value = .11;
        stereo.pan.value = pan;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(stereo);
        stereo.connect(this.channel.master);
        source.start();
        this.nodes.push(source);
        source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); stereo.disconnect(); this.nodes = this.nodes.filter(n => n !== source); };
    }
    canticle() { const ctx = this.channel.ctx; if (!ctx)
        return; const notes = [146.83, 164.81, 196, 174.61, 130.81, 146.83]; for (let i = 0; i < notes.length; i++)
        for (const detune of [-27, 19]) {
            const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * .82;
            o.type = 'triangle';
            o.frequency.value = notes[i];
            o.detune.value = detune + (i % 2 ? 13 : -9);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(.055, t + .16);
            g.gain.exponentialRampToValueAtTime(.0001, t + 2);
            o.connect(g);
            g.connect(this.channel.master);
            o.start(t);
            o.stop(t + 2.05);
            this.nodes.push(o);
            o.onended = () => { o.disconnect(); g.disconnect(); this.nodes = this.nodes.filter(n => n !== o); };
        } }
    stop() { for (const n of this.nodes) {
        try {
            n.stop();
        }
        catch { }
    } this.nodes = []; }
}
