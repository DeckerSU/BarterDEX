import React from 'react'
import { observer, inject } from 'mobx-react';
import * as Icon from 'react-cryptocoins';

import { PieChart, Pie, Cell } from 'recharts';

const getBalanceClass = (short) => `dashboard-balance dashboard-balance-${short.toLowerCase()}`

const getBalanceEvolutionClass = (evolution) => {
    const base = `dashboard-balance-amount-evolution`;
    const extra = evolution > 0 ? 'amount-positive' : 'amount-negative';
    return `${base} ${extra}`;
}


@inject('app')
@observer
class Dashboard extends React.Component {

    render() {
        const { portfolio, colors, portfolioRenderBTC, portfolioRenderFIAT, get24hEvolution, portfolioRenderBalance, portfolioTotal } = this.props.app.portfolio;

        return (
          <div className="dashboard">
            <section className="dashboard-balances">
              <h2>
                <span>Portfolio</span>
                <PieChart className="dashboard-balances-pie" width={200} height={100}>
                  <Pie
                    data={portfolio}
                    dataKey="btcBalance"
                    cx={100}
                    cy={100}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                  >
                    {
                                portfolio.map((coin) => <Cell fill={colors[coin.short]} />)
                        }
                  </Pie>
                </PieChart>
              </h2>

              <ul className="dashboard-balances-list">

                { portfolio.map((entry) => {
                    const evolution = get24hEvolution(entry.short)

                    return (<li className={getBalanceClass(entry.short)}>
                      <u className="dashboard-balance-title">
                        <span className="dashboard-balance-title-logo">
                          <Icon.KmdAlt size={48} />
                          <span className="dashboard-balance-title-logo-name">{ entry.name }</span>
                        </span>
                      </u>
                      <span className="dashboard-balance-amount">
                        <strong className="dashboard-balance-amount-balance">
                          { portfolioRenderFIAT(entry.short) }
                        </strong>
                        <small><strong> { portfolioRenderBalance(entry.short) } </strong> </small>
                        <small>
                          { portfolioRenderBTC(entry.short) }
                        </small>
                        <span className={getBalanceEvolutionClass(evolution)}>(
                              { evolution > 0 ? '+' : '' }
                          { evolution }
                              %)</span>
                      </span>
                    </li>)
                }


                 )
                }
              </ul>
              <footer className="dashboard-balances-footer dashboard-balance">
                <u className="dashboard-balance-title">Total Balance</u>
                <span className="dashboard-balance-amount">
                  <strong className="dashboard-balance-amount-balance">{ portfolioTotal() }</strong>
                  <span className="dashboard-balance-amount-evolution amount-positive">(+40.12%)</span>
                </span>
              </footer>
            </section>

          </div>
        );
    }
}


export default Dashboard
