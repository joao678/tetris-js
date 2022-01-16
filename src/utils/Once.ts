export class Once {
    private once: boolean = false;

    public doOnce(keyState: boolean, cb: Function) {
        if(!this.once && keyState) { cb() }
        this.once = keyState;
    }
}