/*
    portfolio Events handler
*/


export const portfolioEvents = ({ api, emitter, listener }) => {
    listener.on('initializePortfolio', () => {
        api.getPortfolio()
    })

    api.on('initializePortfolio', (data) => {
        /* intercept callback from API and update the store */
        emitter.send('initializePortfolio', data);
        emitter.send('loading', { type: 'delete', key: 2 });
    })
}
