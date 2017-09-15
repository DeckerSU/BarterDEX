import React from 'react'
import { inject, observer } from 'mobx-react'
import {
        Header,
        Footer,
        Placeholder,
        Notifier } from '../components';

import classNames from 'classnames';

@inject('app')
@observer
class Home extends React.Component {

    getClassState = () => {
        const { loader } = this.props.app;
        const hasLoading = loader.store.length;

        return classNames({
            app: true,
            'content-container': true,
            loading: hasLoading
        })
    }

    render() {
        const { loader } = this.props.app;
        const hasLoading = loader.store.length;

        return (
          <content className={this.getClassState()}>
            <Header />
            <section className="app-view">
              { hasLoading === 0 ? 'ready' : <Placeholder /> }
            </section>
            <Notifier />
            <Footer />
          </content>
        )
    }
}

export default Home
