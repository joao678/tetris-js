import { DAS } from "./DAS.js";
import { Once } from "./Once.js";
import { _KEYLIST } from "../index.js";
export class Key {
    constructor(key, fn) {
        this.das = new DAS();
        this.once = new Once();
        this.key = key;
        this.fn = fn;
        _KEYLIST[key] = false;
    }
    everyFrame() {
        if (_KEYLIST[this.key])
            this.fn();
    }
    repeat() {
        this.das.repeat(_KEYLIST[this.key], this.fn);
    }
    doOnce() {
        this.once.doOnce(_KEYLIST[this.key], this.fn);
    }
    doOnceRepeat() {
        this.doOnce();
        this.repeat();
    }
}
//# sourceMappingURL=Key.js.map