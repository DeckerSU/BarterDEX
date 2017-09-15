/*
    Iguana Events handler
*/


export const iguanaEvents = ({ api, emitter, listener }) => {
    /*
        Toggle the broadcaster state
    */
    listener.on('evnt', (event, arg) => {
        /* Intercept actions from app and trigger api endpoints */
    })

    api.on('evnt', (args) => {
        /* intercept callback from API and update the store */
        emitter.send('evnt', args)
    })
}
