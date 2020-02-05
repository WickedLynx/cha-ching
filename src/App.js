import React from 'react';
import styled from 'styled-components';
import { exchanges } from './rates';
import './App.css';

const Field = styled.input`
  margin: 0;
  padding: 0; font-size: 24px;
  height: 30px;
  padding: 8px;
  font-weight: bold;
  text-align: center;
`;

const PriceUnitFieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  height: 50px;
  margin: 0;
  margin-bottom: 16px;
  padding: 0;
`

const Container = styled.div`
  margin: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const PriceUnitField = ({price, quantity, onPriceChange, onQuantityChange}) => (
  <PriceUnitFieldContainer>
    <Field type="input" style={{width: '120px'}} value={price || ''} onChange={onPriceChange} />
    <Field type="input" style={{width: '60px'}} value={quantity || ''} onChange={onQuantityChange} />
  </PriceUnitFieldContainer>
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      exchange: exchanges[0],
      buyPrice: null,
      buyQuantity: null,
      sellPrice: null,
      sellQuantity: null,
      inPercent: null,
      totalBuy: null,
      totalSell: null,
      fees: null,
      netAmount: null,
    };
  }

  resetState() {
    this.setState({ 
      exchange: exchanges[0],
      buyPrice: null,
      buyQuantity: null,
      sellPrice: null,
      sellQuantity: null,
      inPercent: null,
      totalBuy: null,
      totalSell: null,
      fees: null,
      netAmount: null,
    }, this.calculate);
  }

  calculate() {
    const {
      buyPrice,
      buyQuantity,
      sellPrice,
      sellQuantity,
      inPercent,
      exchange,
    } = this.state;

    if (buyPrice && buyPrice > 0 && buyQuantity && buyQuantity > 0) {
      if (inPercent && inPercent > 0) {
        const { fixed, multiplier, max, unitRate } = exchange;
        if (unitRate && unitRate > 0 && !multiplier && !max) {
          const fees = 2 * (fixed + unitRate * buyQuantity);
          const buyCost = buyPrice * buyQuantity;
          const sellTotal = (buyCost + fees) + inPercent * buyCost / 100;
          const sellPrice = sellTotal / buyQuantity;
          this.setState({sellPrice, sellQuantity: buyQuantity, fees});
        } else if (multiplier && multiplier > 0) {
          const fees = (2 * fixed) + multiplier * buyPrice * buyQuantity;
          const buyTotal = buyPrice * buyQuantity;
          const sellTotal = ((inPercent * buyTotal / 100) + fees + buyTotal) / (1 - multiplier);
          const sellPrice = sellTotal / buyQuantity;
          this.setState({sellPrice, sellQuantity: buyQuantity, fees: (fees + sellTotal * multiplier)});
        }
      } else if (sellPrice && sellPrice > 0) {
        const { fixed, multiplier, max, unitRate } = exchange;
        if (unitRate && unitRate > 0 && !multiplier && !max) {
          const fees = 2 * (fixed + unitRate * buyQuantity);
          const buyTotal = buyPrice * buyQuantity;
          const sellTotal = sellPrice * sellQuantity;
          const rate = ((sellTotal - fees - buyTotal) / buyTotal) * 100;
          this.setState({sellQuantity: buyQuantity, fees, inPercent: rate});
        } else if (multiplier && multiplier > 0) {
          const buyTotal = buyPrice * buyQuantity;
          const sellTotal = sellPrice * buyQuantity;
          const fees = (2 * fixed) + multiplier * buyTotal + multiplier * sellTotal;
          const rate = ((sellTotal - fees - buyTotal) / buyTotal) * 100;
          this.setState({sellQuantity: buyQuantity, fees, inPercent: rate});
        }
      }
    }
  }

  render() {
    return (
      <div className="App">
        <Container>
          <button style={{width: '100px'}} onClick={this.resetState.bind(this)}>Reset</button>
          <button style={{width: '100px'}} onClick={this.calculate.bind(this)}>Calculate</button>

          <PriceUnitField
            price={this.state.buyPrice}
            quantity={this.state.buyQuantity}
            onPriceChange={(e) => {
              this.setState({buyPrice: e.target.value})
            }}
            onQuantityChange={(e) => {
              this.setState({buyQuantity: e.target.value});
            }}
          />
          <PriceUnitField
            price={this.state.sellPrice}
            quantity={this.state.sellQuantity}
            onPriceChange={(e) => {
              this.setState({sellPrice: e.target.value});
            }}
            onQuantityChange={(e) => {
              this.setState({sellQuantity: e.target.value});
            }}
          />

          <Field style={{width: '120px'}} type="input" value={this.state.inPercent || ''} onChange={(e) => {
            this.setState({inPercent: e.target.value});
          }}
          />

          { exchanges.map((exchange) => {
            return (
              <div key={exchange.name} style={{width: '100px', marginTop: '16px'}}>
                <input type="radio"
                  id={exchange.name}
                  checked={exchange.name === this.state.exchange.name}
                  onChange={(e) => {
                    this.setState({exchange});
                  }}
                />
                <label style={{marginLeft: '16px'}} htmlFor={exchange.name}>{exchange.name}</label>
              </div>
            );
          })}
          <table style={{marginTop: '16px'}}>
            <tr>
              <td>Buy Total</td>
              <td>{Math.round(this.state.buyPrice * this.state.buyQuantity * 1000) / 1000}</td>
            </tr>
            <tr>
              <td>Sell Total</td>
              <td>{Math.round(this.state.sellPrice * this.state.sellQuantity * 1000) / 1000}</td>
            </tr>
            <tr>
              <td>Fees</td>
              <td>{Math.round(this.state.fees * 1000) / 1000}</td>
            </tr>
            <tr>
              <td>Net</td>
              <td>{Math.round(((this.state.sellPrice * this.state.sellQuantity) - (this.state.buyPrice * this.state.buyQuantity) - this.state.fees) * 1000) / 1000}</td>
            </tr>
          </table>
        </Container>
      </div>
    );
  }
}

export default App;
