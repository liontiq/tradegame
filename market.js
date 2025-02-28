// 商品データ
const goods = [
    {
        id: 'wheat',
        name: '小麦',
        category: '食料',
        basePrice: 20,
        spoilage: 30,
        volatility: 0.2,
        baseQuantity: {min: 50, max: 100},
        weight: 1
    },
    {
        id: 'fish',
        name: '魚',
        category: '食料',
        basePrice: 30,
        spoilage: 5,
        volatility: 0.3,
        baseQuantity: {min: 30, max: 80},
        weight: 1
    },
    {
        id: 'spices',
        name: '香辛料',
        category: '調味料',
        basePrice: 80,
        spoilage: 60,
        volatility: 0.4,
        baseQuantity: {min: 10, max: 30},
        weight: 1
    },
    {
        id: 'silk',
        name: '絹',
        category: '織物',
        basePrice: 150,
        spoilage: 0,
        volatility: 0.3,
        baseQuantity: {min: 5, max: 25},
        weight: 1
    },
    {
        id: 'cloth',
        name: '布地',
        category: '織物',
        basePrice: 70,
        spoilage: 0,
        volatility: 0.2,
        baseQuantity: {min: 20, max: 50},
        weight: 2
    },
    {
        id: 'jewelry',
        name: '宝飾品',
        category: '贅沢品',
        basePrice: 200,
        spoilage: 0,
        volatility: 0.4,
        baseQuantity: {min: 3, max: 15},
        weight: 1
    }
];

// 市場管理システム
const MarketManager = {
    marketData: {},

    // 市場データの初期化
    initializeMarkets() {
        this.marketData = {};
        cities.forEach(city => {
            this.marketData[city.id] = {};
            goods.forEach(good => {
                const specialtyBonus = CityManager.getSpecialtyBonus(city.id, good.id);
                const basePrice = good.basePrice * specialtyBonus;
                const randomFactor = 0.8 + Math.random() * 0.4;
                
                this.marketData[city.id][good.id] = {
                    buyPrice: Math.round(basePrice * randomFactor),
                    sellPrice: Math.round(basePrice * randomFactor * 0.85),
                    quantity: Math.round(good.baseQuantity.min + Math.random() * (good.baseQuantity.max - good.baseQuantity.min)),
                    demand: Math.round(3 + Math.random() * 7)
                };
            });
        });
    },

    // 市場価格の更新（日毎）
    updateMarkets() {
        cities.forEach(city => {
            goods.forEach(good => {
                const market = this.marketData[city.id][good.id];
                const specialtyBonus = CityManager.getSpecialtyBonus(city.id, good.id);
                
                // 価格変動
                const volatilityFactor = 1 + (Math.random() * 2 - 1) * good.volatility;
                const growthFactor = 1 + ((city.growthLevel - 1) * 0.05);
                
                market.buyPrice = Math.round(good.basePrice * specialtyBonus * volatilityFactor * growthFactor);
                market.sellPrice = Math.round(market.buyPrice * 0.85);
                
                // 在庫の自然回復
                const targetStock = (good.baseQuantity.min + good.baseQuantity.max) / 2 * growthFactor;
                const restockRate = 0.2;
                market.quantity = Math.round(market.quantity + (targetStock - market.quantity) * restockRate);
            });
        });
    },

    // 特定の都市の市場価格を調整（成長レベル変更時）
    adjustCityPrices(cityId) {
        const city = cities.find(c => c.id === cityId);
        if (!city || !this.marketData[cityId]) return;

        goods.forEach(good => {
            const market = this.marketData[cityId][good.id];
            const specialtyBonus = CityManager.getSpecialtyBonus(cityId, good.id);
            const growthFactor = 1 + ((city.growthLevel - 1) * 0.05);
            
            market.quantity = Math.round(market.quantity * growthFactor);
            market.buyPrice = Math.round(good.basePrice * specialtyBonus * growthFactor);
            market.sellPrice = Math.round(market.buyPrice * 0.85);
        });
    }
};

// グローバルに公開
window.goods = goods;
window.MarketManager = MarketManager;