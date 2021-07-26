

const Utils = {
    isObject: (obj: any) => {
        return typeof obj === 'object';
    },
    isObjectEmpty: (obj: Object): boolean => {
        // if (!obj) { throw new Error('not an object:'+ obj) }
        return (Utils.isObject(obj) && Object.keys(obj).length === 0);
    },
    isObjectWithData: (obj: Object): boolean => {
        // if (!obj) { throw new Error('not an object:'+ obj) }
        return (Utils.isObject(obj) && Object.keys(obj).length !== 0);
    }
}
export default Utils;
