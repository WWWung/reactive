import { track, trigger } from "./effect.js"
import { reactive, toRaw } from "./reactive.js"
import { hasChanged, isObject } from "./utils.js"

class RefImpl {
    _value = null
    _rawValue = null
    _v__ref = true
    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
    }
    get value() {
        track(toRaw(this), "value")
        return this._value
    }

    set value(newValue) {
        if (hasChanged(this.value, newValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            trigger(toRaw(this), "value", "set", newValue)
        }
    }
}

class ObjectRefImpl {
    _key = ""
    _object = null
    _v__ref = true
    constructor(obj, key) {
        this._key = key
        this._object = obj
    }

    get value() {
        return this._object[this._key]
    }

    set value(newValue) {
        this._object[this._key] = newValue
    }
}

export function toRef(object, key) {
    return isRef(object[key]) ? object[key] : new ObjectRefImpl(object, key)
}

export function toRefs(object) {
    const res = Array.isArray(object) ? [] : {}
    Object.keys(object).forEach(key => {
        res[key] = toRef(object, key)
    })
    return res
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

export function ref(value) {
    return isRef(value) ? value : new RefImpl(value)
}

export function isRef(value) {
    return !!(value && value._v__ref)
}

export function unref(value) {
    return isRef(value) ? value._rawValue : value
}