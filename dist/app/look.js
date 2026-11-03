// Pointer lock is requested only from explicit player gestures; never from an animation frame.
export function captureMouse(canvas, onFailure, mouseGesture = false) {
    if (!mouseGesture && !matchMedia('(pointer: fine)').matches)
        return;
    if (!canvas.requestPointerLock) {
        onFailure("Pointer Lock API unavailable");
        return;
    }
    try {
        const pending = canvas.requestPointerLock();
        pending?.catch(onFailure);
    }
    catch (error) {
        onFailure(error);
    }
}
export function lookDelta(yaw, pitch, x, y) { return { yaw: yaw - x * .004, pitch: Math.max(-1.2, Math.min(1.2, pitch - y * .003)) }; }
export function volumeMix(value) { const master = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 65)) / 100; return { music: master * (45 / 65), effects: master }; }
// Touch PointerEvents do not reliably provide movementX/movementY. Track the
// captured finger in client coordinates, ignoring additional fingers entirely.
export class LookContact {
    id = null;
    x = 0;
    y = 0;
    travel = 0;
    begin(id, x, y) { if (this.id !== null)
        return false; this.id = id; this.x = x; this.y = y; this.travel = 0; return true; }
    move(id, x, y) { if (this.id !== id)
        return null; const dx = x - this.x, dy = y - this.y; this.x = x; this.y = y; this.travel += Math.hypot(dx, dy); return { x: dx, y: dy }; }
    end(id) { if (this.id !== id)
        return null; const tap = this.travel < 9; this.id = null; return { tap }; }
    cancel() { this.id = null; this.travel = 0; }
}
