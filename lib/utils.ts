

const Utils = {
    isObject: (obj: any) => {
        return typeof obj === 'object';
    },
    isObjectEmpty: (obj: Object): boolean => {
        return (Utils.isObject(obj) && Object.keys(obj).length === 0);
    },
    isObjectWithData: (obj: Object): boolean => {
        return (Utils.isObject(obj) && Object.keys(obj).length !== 0);
    }
}
export default Utils;
