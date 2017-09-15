/*
    Iguana Events handler
*/


export const iguanaEvents = ({ api, emitter, listener }) => {
    /*
        Toggle the broadcaster state
    */
    listener.on('startIguana', (event) => {
        /* Intercept actions from app and trigger api endpoints */
        /* setTiemout just for testing purpose*/
        setTimeout(() => api.startIguana(), 2000)
    })

    api.on('iguanaStarted', () => {
        /* intercept callback from API and update the store */
        emitter.send('loading', { type: 'delete', key: 1 });
    })
}
