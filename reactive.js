import { track, trigger, enableTracking, pauseTracking } from "./effect.js";
import { isRef } from "./ref.js";
import { isIntegerKey, hasChanged, isObject } from "./utils.js";

const reactiveMap = new Map();

export const ITERATE_KEY = Symbol("");

const symbolKyes = Object.getOwnPropertyNames(Symbol)
  .map(key => Symbol[key])
  .filter(v => typeof v === "symbol");

const arrayInstrumentations = new Map();

["push", "pop", "shift", "unshift", "splice"].forEach(key => {
  const method = Array.prototype[key];
  const wrapped = function(...args) {
    pauseTracking();
    const res = method.apply(this, args);
    enableTracking();
    return res;
  };
  arrayInstrumentations.set(key, wrapped);
});

["includes", "indexOf", "lastIndexOf"].forEach(key => {
    const method = Array.prototype[key];
    const wrapped = function(...args) {
        const arr = toRaw(this);
        for (let i = 0; i < args.length; i++) {
            track(arr, i + "")
        }
        const rsl = method.apply(this, args)
        if (rsl === -1 || rsl === false) {
            return method.apply(arr, args)
        } else {
            return rsl
        }
    }
    arrayInstrumentations.set(key, wrapped);
})

/**
 * 创建响应式变量
 * @param {*} obj
 */
export function reactive(obj) {
  if (isReactive(obj)) {
    return obj;
  }
  if (reactiveMap.has(obj)) {
    return reactiveMap.get(obj);
  }
  const observed = new Proxy(obj, {
    get(target, property, receiver) {
      if (property === "__v_isReactive") {
        return true;
      }
      if (property === "__v_raw" && receiver === reactiveMap.get(target)) {
        return target;
      }
      // const value = target[property]
      const value = Reflect.get(target, property, receiver);
      if ([...symbolKyes, "__proto__"].includes(property)) {
        return value;
      }
      if (arrayInstrumentations.has(property)) {
        return arrayInstrumentations.get(property);
      }
      track(target, property);
      // isObject(value) && reactive(value)
      if (isRef(value)) {
        return value.value
      }
      if (isObject(value)) {
        return reactive(value);
      }
      // console.log("get", target, property)
      return value;
    },
    set(target, property, value, receiver) {
      if (property === "__v_isReactive") {
        return true;
      }
      if (isReactive(value)) {
        value = toRaw(value);
      }
      const hasKey =
        Array.isArray(target) && isIntegerKey(property)
          ? Number(property) < target.length
          : {}.hasOwnProperty.call(target, property);
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (hasChanged(value, oldValue)) {
        if (target === toRaw(receiver)) {
          trigger(target, property, hasKey ? "set" : "add", value);
        }
      }

      return result;
    },
    deleteProperty(target, property) {
      const rsl = Reflect.deleteProperty(target, property);
      trigger(target, property, "del", undefined);
      return rsl;
    },
    has(target, key) {
      track(target, key);
      const rsl = Reflect.has(target, key);
      return rsl;
    },
    ownKeys(target) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    }
  });
  reactiveMap.set(obj, observed);
  return observed;
}

export function isReactive(ob) {
  return ob.__v_isReactive === true;
}

export function toRaw(ob) {
  return (ob && ob.__v_raw) || ob;
}
