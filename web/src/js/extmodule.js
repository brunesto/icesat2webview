
/**
 * 
 * @param {*} name global name of module 
 * @param {*} srcUrl script src to be loaded
 * @param {*} callback (boolean)
 */
export function loadExtModule(name, srcUrl, callback) {

    console.log("loadExtModule:" + name + " starts")

    // already available?
    if (window[name]) {
        console.log("loadExtModule:" + name + ": window[" + name +"] is already defined!", window.egm96)
        if (callback) callback(true)
        return
    }

    // ensure env is clean
    if (window.export) {
        console.log("loadExtModule:" + name + ": window.export is already defined!", window.export)
        if (callback) callback(false)
        return
    }
    if (window.require) {
        console.log("loadExtModule:" + name + ": window.require is already defined!", window.require)
        if (callback) callback(false)
        return
    }

    // 1 set up module environment stub
    window.exports = {}
    window.require = function(x) {
            console.log("loadExtModule:" + name + ": require " + x + " returns ", window[x])
            return window[x]
        }
        // 2 load module from src urkl
    const script = document.createElement('script')
    script.src = srcUrl
    script.onload = () => {
        window[name] = exports;
        console.log("loadExtModule:" + name + ": module loaded", exports)
            // cleanup
        exports = null
        require = null
            // callback
        if (callback) callback(true)
    }

    // launch...
    document.head.append(script)
}