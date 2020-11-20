import { track, trigger } from "./effect.js"
import { reactive, toRaw } from "./reactive.js"
import { hasChanged, isObject } from "./utils.js"

class RefImpl {
    _value = null
    _v__ref = true
    constructor(value) {
        this._value = value
        this.__v_raw = value
    }
    get value() {
        track(toRaw(this), "value")
        return isObject(this._value) ? reactive(this._value) : this._value
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
    return value && value._v__ref
}