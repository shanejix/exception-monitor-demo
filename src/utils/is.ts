export function isString(wat: any): boolean {
    return Object.prototype.toString.call(wat) === '[object String]'
}