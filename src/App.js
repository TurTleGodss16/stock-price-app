import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, TimeScale, PointElement, LinearScale, LineElement } from 'chart.js';
import 'chartjs-adapter-moment';

Chart.register(CategoryScale, TimeScale, PointElement, LinearScale, LineElement);

const StockPriceApp = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [stockList, setStockList] = useState([]);

  const handleSymbolChange = (event) => {
    setSelectedSymbol(event.target.value);
  };

  useEffect(() => {
    const fetchStockList = async () => {
      const API_KEY = 'ckr2f6hr01quf3kmvpggckr2f6hr01quf3kmvph0';
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${API_KEY}`);
        setStockList(response.data);
      } catch (error) {
        console.error('Error fetching stock list:', error);
      }
    };

    fetchStockList();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSymbol) {
        return;
      }

      const API_KEY = 'ckr2f6hr01quf3kmvpggckr2f6hr01quf3kmvph0';
      try {
        const [stockResponse, historicalResponse] = await Promise.all([
          axios.get(`https://finnhub.io/api/v1/quote?symbol=${selectedSymbol}&token=${API_KEY}`),
          axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${selectedSymbol}&resolution=D&from=${Math.floor(
            Date.now() / 1000 - 30 * 24 * 60 * 60
          )}&to=${Math.floor(Date.now() / 1000)}&token=${API_KEY}`)
        ]);

        setStockData(stockResponse.data);
        setHistoricalData(historicalResponse.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  if (!stockData || !historicalData) {
    return <div>Loading...</div>;
  }

  const dates = historicalData.t.map((timestamp) => new Date(timestamp * 1000));
  const prices = historicalData.c;

  const data = {
    labels: dates,
    datasets: [
      {
        label: `${selectedSymbol} Price`,
        data: prices,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h1>Real-Time Stock Price</h1>
      <label htmlFor="symbol">Select Symbol: </label>
      <select id="symbol" value={selectedSymbol} onChange={handleSymbolChange}>
        <option value="">Select a Stock</option>
        {stockList.map((stock) => (
          <option key={stock.symbol} value={stock.symbol}>
            {`${stock.symbol} (${stock.description})`}
          </option>
        ))}
      </select>
      {selectedSymbol && (
        <div>
          <p>Symbol: {stockData.symbol}</p>
          <p>Price: {stockData.c}</p>

          <div style={{ height: '400px', width: '80%', margin: '0 auto' }}>
            <Line
              data={data}
              options={{
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'day', // Adjust the time unit as needed
                    },
                  },
                  y: {
                    type: 'linear', // Use linear scale for the y-axis
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPriceApp;
