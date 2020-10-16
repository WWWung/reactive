/**
 * 创建响应式变量
 * @param {*} obj 
 */
function reactive(obj) {
    if (isReactive(obj)) {
        return obj
    }
    const observed = new Proxy(obj, {
        get(target, property) {
            if (property === "__v_isReactive") {
                return true
            }
            track(target, property)
            const value = target[property]
            // isObject(value) && reactive(value)
            if (isObject(value)) {
                return reactive(value)
            }
            // console.log("get", target, property)
            return target[property];
        },
        set(target, property, value) {
            if (property === "__v_isReactive") {
                return true
            }
            const hasKey = Array.isArray(target) && isIntegerKey(property) ?
            Number(property) < target.length :
            ({}).hasOwnProperty.call(target, property)
            const oldValue = target[property]
            const result = Reflect.set(target, property, value)
            if (hasChanged(value, oldValue)) {
                trigger(target, property, hasKey ? "set" : "add", value)
            }
            
            return result
        }
    })
    return observed
}

function isReactive(ob) {
    return ob.__v_isReactive === true
}

