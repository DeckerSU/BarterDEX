import React from 'react'
import { ipcRenderer } from 'electron';
import close from '../../static/traffic-light-close.svg';
import minimize from '../../static/traffic-light-minimize.svg';
import maximize from '../../static/traffic-light-maximize.svg';


class Header extends React.Component {
    closeWindow = (event) => {
        ipcRenderer.send('close');
    }

    minimizeWindow = () => {
        ipcRenderer.send('minimize');
    }

    render() {
        return (
          <header className="window-header">
            <ul>
              <li className="window__controls">
                <a
                  onClick={(event) => this.closeWindow(event)}
                  className="window__controls-close"
                  dangerouslySetInnerHTML={{ __html: close }}
                />
                <a
                  onClick={() => this.minimizeWindow()}
                  className="window__controls-minimize"
                  dangerouslySetInnerHTML={{ __html: minimize }}
                />
                <a
                  onClick={() => this.minimizeWindow()}
                  className="window__controls-maximize"
                  dangerouslySetInnerHTML={{ __html: maximize }}
                />
              </li>
              <li className="window__title" />
            </ul>
          </header>
        );
    }
}

export default Header
