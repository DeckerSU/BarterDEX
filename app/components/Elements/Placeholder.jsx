import React from 'react'
import { observer, inject } from 'mobx-react';
import { MainLoader } from '..';
import logo from '../../static/favicon.svg';


class Placeholder extends React.Component {
    render() {
        return (
          <div className="Placeholder">
            <div className="Placeholder-bg"> <span /> </div>
            <section className="Placeholder-tagline">
              <i className="Placeholder-logo" dangerouslySetInnerHTML={{ __html: logo }} />
              <h1 className="Placeholder-text">Barter<strong>DEX</strong></h1>
            </section>
            <MainLoader />
          </div>
        );
    }
}


export default Placeholder
