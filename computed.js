import { effect, track, trigger } from "./effect.js"
import { toRaw } from "./reactive.js"

export function computed(fn) {
    return new ComputedImpl(fn)
}

class ComputedImpl {
    dirty = true
    _value = null
    constructor(fn) {
        this._effect = effect(fn, 
        { 
            lazy: true,
            scheduler: () => {
                if (!this.dirty) {
                    this.dirty = true
                    trigger(this, "value", "set")
                }
            }
        })
    }

    get value() {
        track(this, "value")
        if (this.dirty) {
            this.dirty = false
            return (this._value = this._effect())
        }
        return this._value
    }
}