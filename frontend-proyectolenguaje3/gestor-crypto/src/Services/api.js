import axios from 'axios';

export const getMarketData = async () => {
  try {
    // URL más limpia para evitar bloqueos de red
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        // IDs correctos para tus 5 monedas
        // IDs correctos para tus 5 monedas
        ids: 'ripple,bitcoin,ethereum,dogecoin,tether',
        order: 'market_cap_desc',
        per_page: 20, // Aumentamos por si acaso
        page: 1,
        sparkline: false,
        _: new Date().getTime(), // Cache buster
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error en API:", error);
    return [];
  }
};