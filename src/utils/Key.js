import { DAS } from "./DAS.js";
import { Once } from "./Once.js";
import { _KEYLIST, _FPS } from "../index.js"

export class Key {
    das = new DAS();
    once = new Once();
    key;
    fn;

    constructor(key, fn) {
        this.key = key;
        this.fn = fn;
        _KEYLIST[key] = false;
    }

    everyFrame() {
        if(_KEYLIST[this.key]) this.fn();
    }

    repeat() {
        this.das.repeat(_KEYLIST[this.key],this.fn);
    }

    doOnce() {
        this.once.doOnce(_KEYLIST[this.key],this.fn);
    }

    doOnceRepeat() {
        this.doOnce();
        this.repeat();
    }
}