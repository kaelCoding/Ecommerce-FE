const loadFile = (idFile) => {
    return `https://ecommerce-be-yxmb.onrender.com/${idFile}`
}
 
export default {
    install: (app, options) => {
        app.config.globalProperties.$loadFile = loadFile
        app.provide('$loadFile', loadFile)
    }
}