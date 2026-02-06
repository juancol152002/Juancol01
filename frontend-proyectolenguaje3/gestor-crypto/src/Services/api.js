import axios from 'axios';

export const getMarketData = async () => {
  try {
    // URL más limpia para evitar bloqueos de red
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        // IDs correctos para tus 5 monedas
        ids: 'bitcoin,ethereum,dogecoin,tether,proton', 
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error en API:", error);
    return []; 
  }
};