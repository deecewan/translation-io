/* @flow */

export default function hasProp(obj: Object, prop: string) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
