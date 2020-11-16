export function isObject(v) {
    return v !== null && typeof v === "object"
}

export function hasChanged(value, oldValue) {
    return value !== oldValue && (value === value || oldValue === oldValue)
}

export function isIntegerKey(key) {
    return typeof key === "string" &&
    key !== "NaN" &&
    key[0] !== "-" &&
    "" + parseInt(key) === key
}