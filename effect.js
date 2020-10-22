const targetMap = new Map()
const effectStack = []
let activeEffect = null

/**
 * 收集依赖
 */
function track(target, property) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(property)
    if (!dep) {
        depsMap.set(property, (dep = new Set()))
    }
    if (activeEffect && !dep.has(activeEffect)) {
        dep.add(activeEffect)
    }
}

/**
 * 添加依赖
 */
function effect(fn) {
    const effectFn = function() {
        if (!effectStack.includes(effectFn)) {
            try {
                activeEffect = effectFn
                effectStack.push(effectFn)
                return fn()
            } finally {
                activeEffect = null
                effectStack.pop()
                activeEffect = effectStack[effectStack.length - 1]
            }
        }
    }
    effectFn()
    return effectFn
}

/**
 * 触发依赖
 */
function trigger(target, property, type, newValue) {
    const depsMap = targetMap.get(target)
    const dep = depsMap.get(property)
    const effects = new Set()
    const add = function (effectsToAdd) {
        if (effectsToAdd) {
            effectsToAdd.forEach(effect => {
                if (activeEffect !== effect) {
                    effects.add(effect)
                }
            })
        }
    }
    if (property === "length" && Array.isArray(target)) {
        depsMap.forEach((dep, key) => {
            if (key === "length" || key >= newValue) {
                add(dep)
            }
        })
    }
    if (type === "add") {
        if (Array.isArray(target)) {
            if (isIntegerKey(property)) {
                add(depsMap.get("length"))
            }
        }
    } else if (type === "set") {

    }
    add(dep)
    const run = function(effect) {
        effect()
    }
    effects.forEach(run)
}