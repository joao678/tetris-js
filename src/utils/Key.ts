import { DAS } from "./DAS.js";
import { Once } from "./Once.js";
import { _KEYLIST, _FPS } from "../index.js"

export class Key {
    private das: DAS = new DAS();
    private once: Once = new Once();
    private key: string;
    private fn: Function;

    constructor(key: string, fn: Function) {
        this.key = key;
        this.fn = fn;
        _KEYLIST[key] = false;
    }

    public everyFrame() {
        if(_KEYLIST[this.key]) this.fn();
    }

    public repeat() {
        this.das.repeat(_KEYLIST[this.key],this.fn);
    }

    public doOnce() {
        this.once.doOnce(_KEYLIST[this.key],this.fn);
    }

    public doOnceRepeat() {
        this.doOnce();
        this.repeat();
    }
}