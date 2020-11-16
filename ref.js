import { track, trigger } from "./effect.js"
import { toRaw } from "./reactive.js"
import { hasChanged } from "./utils.js"

class RefImpl {
    _value = null
    _v__ref = true
    constructor(value) {
        this._value = value
    }
    get value() {
        track(toRaw(this), "value")
        return this._value
    }

    set value(newValue) {
        if (hasChanged(this.value, newValue)) {
            this._value = newValue
            trigger(toRaw(this), "value", "set", newValue)
        }
    }
}

export function ref(value) {
    return isRef(value) ? value : new RefImpl(value)
}

export function isRef(value) {
    return !!value._v__ref
}