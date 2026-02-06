import React, { useEffect, useRef, memo } from 'react';

const CryptoChart = ({ symbol }) => {
  const container = useRef();

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = ''; // Limpia la gráfica anterior
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbol": symbol.includes(":") ? symbol : `BINANCE:${symbol}`, // Agrega BINANCE solo si no tiene prefijo
        "width": "100%",
        "height": "220",
        "locale": "es",
        "dateRange": "12M",
        "colorTheme": "dark",
        "isTransparent": true,
        "autosize": false,
        "largeChartUrl": ""
      });
      container.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(CryptoChart);