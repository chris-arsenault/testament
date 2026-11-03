// Pointer lock is requested only from explicit player gestures; never from an animation frame.
export function captureMouse(canvas, onFailure) {
    if (!matchMedia('(pointer: fine)').matches)
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
