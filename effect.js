import { ITERATE_KEY } from "./reactive.js";
import { isIntegerKey } from "./utils.js";

const targetMap = new Map();
const effectStack = [];
let activeEffect = null;
let shouldTrack = true;

/**
 * 收集依赖
 */
export function track(target, property) {
  if (!shouldTrack || !activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(property);
  if (!dep) {
    depsMap.set(property, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    activeEffect.deps.push(dep);
    dep.add(activeEffect);
  }
}

export function pauseTracking() {
  shouldTrack = false;
}

export function enableTracking() {
  shouldTrack = true;
}

/**
 * 添加依赖
 */
export function effect(fn, opts = {}) {
  const effectFn = function() {
    if (!effectStack.includes(effectFn)) {
      cleanup(effectFn);
      try {
        enableTracking();
        activeEffect = effectFn;
        effectStack.push(effectFn);
        return fn();
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effectFn.deps = [];
  effectFn.opts = opts
  effectFn.active = true
  if (!opts.lazy) {
    effectFn();
  }
  return effectFn;
}

function cleanup(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}

/**
 * 触发依赖
 */
export function trigger(target, property, type, newValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(property);
  const effects = new Set();
  const add = function(effectsToAdd) {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (activeEffect !== effect && effect.active) {
          effects.add(effect);
        }
      });
    }
  };
  if (property === "length" && Array.isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === "length" || key >= newValue) {
        add(dep);
      }
    });
  }
  if (type === "add") {
    if (Array.isArray(target)) {
      if (isIntegerKey(property)) {
        add(depsMap.get("length"));
      }
    }
  } else if (type === "set") {
  } else if (type === "del") {
  }
  add(depsMap.get(ITERATE_KEY));
  add(dep);
  const run = function(effect) {
    if (effect.opts.scheduler) {
        effect.opts.scheduler(effect)
    } else {
        effect();
    }
  };
  effects.forEach(run);
}

export function stop(effect) {
    effect.active = false
    cleanup(effect)
}