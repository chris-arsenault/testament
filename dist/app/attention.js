export const dwellDuration = (kind) => kind === 'threshold' ? 2.2 : kind === 'stone' ? 4.2 : kind === 'angel' ? 3.5 : 3;
export function interruptAttention(w) { w.attention = 0; w.gazeId = ''; w.gazeKind = 'none'; w.gazeCue = false; w.gazeFired = false; w.gazeApplied = false; w.gazeLost = 0; }
export function attend(w, dt, kind, id) {
    if (kind === 'none') {
        w.gazeLost += dt;
        w.attention = 0;
        if (w.gazeLost > .25)
            interruptAttention(w);
        return false;
    }
    if (id !== w.gazeId) {
        interruptAttention(w);
        w.gazeId = id;
        w.gazeKind = kind;
    }
    w.gazeLost = 0;
    w.attention = Math.min(20, w.attention + dt);
    if (!w.gazeCue && w.attention >= dwellDuration(kind) * .2) {
        w.gazeCue = true;
        w.events.push({ kind: 'gaze-cue', text: '' });
    }
    if (!w.gazeFired && w.attention >= dwellDuration(kind)) {
        w.gazeFired = true;
        return true;
    }
    return false;
}
