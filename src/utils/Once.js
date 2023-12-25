export class Once {
    once = false;

    doOnce(keyState, cb) {
        if (!this.once && keyState) cb();
        this.once = keyState;
    }
}