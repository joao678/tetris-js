import { _FPS } from "../index.js";
export class DAS {
    constructor() {
        this.firstTimer = 0;
        this.repeatTimer = 0;
        this._FIRST_TIME_DELAY = 15;
        this._REPEAT_RATE = 2;
    }
    repeat(key, cb) {
        let _REAL_FIRST_TIME_DELAY = (this._FIRST_TIME_DELAY * _FPS) / 60;
        let _REAL_REPEAT_RATE = (this._REPEAT_RATE * _FPS) / 60;
        if (key) {
            this.firstTimer <= _REAL_FIRST_TIME_DELAY ? this.firstTimer++ : null;
        }
        else {
            this.firstTimer = 0;
        }
        ;
        if (this.firstTimer >= _REAL_FIRST_TIME_DELAY) {
            if (this.repeatTimer <= _REAL_REPEAT_RATE)
                this.repeatTimer++;
        }
        else {
            this.repeatTimer = 0;
        }
        ;
        if (this.repeatTimer >= _REAL_REPEAT_RATE) {
            cb();
            this.repeatTimer = 0;
        }
        ;
    }
}
//# sourceMappingURL=DAS.js.map