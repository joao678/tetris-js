export class Once {
    constructor() {
        this.once = false;
    }
    doOnce(keyState, cb) {
        if (!this.once && keyState) {
            cb();
        }
        this.once = keyState;
    }
}
//# sourceMappingURL=Once.js.map