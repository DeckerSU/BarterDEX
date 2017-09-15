import React from 'react'
import { observer, inject } from 'mobx-react';

@inject('app')
@observer
class Dashboard extends React.Component {


    render() {
        return (
          <div className="dashboard">
            <ul className="dashboard-balances">
              <li className="dashboard-balance">
                <u className="dashboard-balance-title">Total Balance</u>
                <span className="dashboard-balance-amount">
                  <strong className="dashboard-balance-amount-balance">$1.222,44</strong>
                  <span className="dashboard-balance-amount-evolution amount-positive">(+40.12%)</span>
                </span>

              </li>
            </ul>
          </div>
        );
    }
}


export default Dashboard
