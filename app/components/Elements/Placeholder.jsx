import React from 'react'
import { observer, inject } from 'mobx-react';

import { Link } from 'react-router'
import logo from '../../static/favicon.svg';


class Placeholder extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
          <div className="Placeholder">
            <section className="Placeholder-tagline">
              <i className="Placeholder-logo" dangerouslySetInnerHTML={{ __html: logo }} />
              <h1 className="Placeholder-text">Barter<strong>DEX</strong></h1>
            </section>
          </div>
        );
    }
}


export default Placeholder
