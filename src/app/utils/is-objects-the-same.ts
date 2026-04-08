function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isObjectsTheSame(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2) || obj1.length !== obj2.length) {
      return false;
    }

    return obj1.every((item, index) => isObjectsTheSame(item, obj2[index]));
  }

  if (!isObject(obj1) || !isObject(obj2)) {
    return false;
  }

  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  return obj1Keys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      return false;
    }

    return isObjectsTheSame(obj1[key], obj2[key]);
  });
}