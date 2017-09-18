import React from 'react'
import { observer, inject } from 'mobx-react';
import * as Icon from 'react-cryptocoins';

import { PieChart, Pie, Cell } from 'recharts';

const getBalanceClass = (short) => `dashboard-balance dashboard-balance-${short} shadow`

const getBalanceEvolutionClass = (evolution) => {
    const base = `dashboard-balance-amount-evolution`;
    const extra = evolution > 0 ? 'amount-positive' : 'amount-negative';
    return `${base} ${extra}`;
}


const capitalize = (string) => string.toLowerCase().charAt(0).toUpperCase() + string.slice(1).toLowerCase()

@inject('app')
@observer
class Dashboard extends React.Component {

    renderIcon = (coin) => {
        switch (coin) {
        case 'KMD':
            return (<Icon.KmdAlt size={42} />);
            break;
        case 'NEO':
            return (<Icon.Neos size={42} />);
            break;
        default:
            const TagName = Icon[capitalize(coin)];
            return <TagName size={42} />;
            break;

        }
    }

    render() {
        const { portfolio, colors, portfolioRenderBTC, portfolioRenderFIAT, get24hEvolution, portfolioRenderBalance, portfolioTotal, portfolioEvolution, portfolioTotalBtc } = this.props.app.portfolio;
        const balanceEvolution = portfolioEvolution();
        return (
          <div className="dashboard">

            <section className="dashboard-market" />

            <section className="dashboard-balances shadow">
              <header>
                <h2>
                  <span className="dashboard-balance-amount">
                    <strong className="dashboard-balance-amount-balance xtra-large-number">{ portfolioTotal() }</strong>
                    <span className={getBalanceEvolutionClass(balanceEvolution)}>(
                                  { balanceEvolution > 0 ? '+' : '' }
                      { balanceEvolution }
                                  %)</span>
                  </span>
                  <PieChart className="dashboard-balances-pie " width={200} height={100}>
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
                                      portfolio.map((coin) => <Cell stroke="transparent" fill={colors[coin.short]} />)
                              }
                    </Pie>
                  </PieChart>
                </h2>

                <footer className="dashboard-footer">
                  <button className="dashboard-add withBorder">ADD COIN</button>
                </footer>
              </header>


              <ul className="dashboard-balances-list">

                { portfolio.map((entry) => {
                    const evolution = get24hEvolution(entry.short)

                    return (<li className={getBalanceClass(entry.short)}>
                      <span className="dashboard-balance-amount">
                        <strong className="dashboard-balance-amount-balance large-number">
                          { portfolioRenderFIAT(entry.short) }
                        </strong>
                        <small><strong> { portfolioRenderBalance(entry.short) } </strong> </small>
                        {
                            entry.short !== 'BTC' ? <small className="dashboard-balance-amount-crypto"><strong> { portfolioRenderBTC(entry.short) } </strong> </small> : ''
                        }


                        <span className={getBalanceEvolutionClass(evolution)}>(
                              { evolution > 0 ? '+' : '' }
                          { evolution }
                              %)</span>
                      </span>
                      <u className="dashboard-balance-title coin-colorized">
                        <span className="dashboard-balance-title-logo">
                          { this.renderIcon(entry.short) }
                          <span className="dashboard-balance-title-logo-name">{ entry.name }</span>
                        </span>
                      </u>
                      <span className="coin-bg" />
                    </li>)
                }


                 )
                }
              </ul>
            </section>

          </div>
        );
    }
}


export default Dashboard
