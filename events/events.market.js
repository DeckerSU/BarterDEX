/*
    Market Events handler
*/


export const marketEvents = ({ api, emitter, listener }) => {
    listener.on('watchMarket', () => {
        setTimeout(() => api.marketLoop(), 400);
        setInterval(() => api.marketLoop(), 60000)
    })

    api.on('trades', (data) => emitter.send('trades', data))

    api.on('marketUpdate', (data) => {
        /* intercept callback from API and update the store */
        emitter.send('marketUpdate', data);
        emitter.send('portfolioUpdate');
        emitter.send('loading', { type: 'delete', key: 3 });
    })
}
