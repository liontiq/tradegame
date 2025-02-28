// 都市データ
const cities = [
    {
        id: 'lisbon',
        name: 'リスボン',
        description: 'ポルトガルの首都。ヨーロッパの中心的貿易港。',
        connections: ['london', 'venice', 'tunis'],
        travelDays: {london: 5, venice: 8, tunis: 6},
        growthLevel: 1,
        investments: 0,
        specialties: ['wine', 'fish', 'salt'],
        bonusMultiplier: 1.5 // 特産品の取引で50%ボーナス
    },
    {
        id: 'london',
        name: 'ロンドン',
        description: '毛織物や工芸品が豊富なイギリスの首都。',
        connections: ['lisbon', 'amsterdam'],
        travelDays: {lisbon: 5, amsterdam: 3},
        growthLevel: 1,
        investments: 0,
        specialties: ['cloth', 'metals'],
        bonusMultiplier: 1.4
    },
    {
        id: 'venice',
        name: 'ベネチア',
        description: '地中海の商業共和国。香辛料と絹の取引で栄える。',
        connections: ['lisbon', 'alexandria', 'istanbul'],
        travelDays: {lisbon: 8, alexandria: 7, istanbul: 6},
        growthLevel: 1,
        investments: 0,
        specialties: ['silk', 'spices', 'jewelry'],
        bonusMultiplier: 1.6
    },
    {
        id: 'amsterdam',
        name: 'アムステルダム',
        description: 'オランダの商業中心。金融と造船業が発達。',
        connections: ['london', 'hamburg'],
        travelDays: {london: 3, hamburg: 2},
        growthLevel: 1,
        investments: 0,
        specialties: ['cloth', 'fish'],
        bonusMultiplier: 1.3
    },
    {
        id: 'alexandria',
        name: 'アレクサンドリア',
        description: 'エジプトの港町。アフリカからの珍しい商品の集散地。',
        connections: ['venice', 'istanbul'],
        travelDays: {venice: 7, istanbul: 5},
        growthLevel: 1,
        investments: 0,
        specialties: ['spices', 'pottery'],
        bonusMultiplier: 1.5
    },
    {
        id: 'istanbul',
        name: 'イスタンブール',
        description: 'オスマン帝国の首都。東西の文化が交わる交易拠点。',
        connections: ['venice', 'alexandria'],
        travelDays: {venice: 6, alexandria: 5},
        growthLevel: 1,
        investments: 0,
        specialties: ['silk', 'spices', 'jewelry'],
        bonusMultiplier: 1.7
    },
    {
        id: 'tunis',
        name: 'チュニス',
        description: '北アフリカの港町。砂糖と香料の取引が盛ん。',
        connections: ['lisbon'],
        travelDays: {lisbon: 6},
        growthLevel: 1,
        investments: 0,
        specialties: ['spices', 'salt'],
        bonusMultiplier: 1.4
    },
    {
        id: 'hamburg',
        name: 'ハンブルク',
        description: 'ドイツの自由都市。バルト海貿易の拠点。',
        connections: ['amsterdam'],
        travelDays: {amsterdam: 2},
        growthLevel: 1,
        investments: 0,
        specialties: ['timber', 'metals'],
        bonusMultiplier: 1.3
    }
];

// 都市管理関数
const CityManager = {
    // 都市の成長処理
    growCity(cityId, investment = 0) {
        const city = cities.find(c => c.id === cityId);
        if (!city) return;

        city.investments += investment;
        const growthRate = 1 + Math.floor(city.investments / 500);
        city.growthLevel += growthRate;

        // 市場データの更新をMarketManagerに依頼
        MarketManager.adjustCityPrices(cityId);
        return city.growthLevel;
    },

    // 都市への投資処理
    investInCity(cityId, amount) {
        const city = cities.find(c => c.id === cityId);
        if (!city) return false;

        if (gameState.money < amount) return false;

        gameState.money -= amount;
        this.growCity(cityId, amount);
        return true;
    },

    // 特産品ボーナスの計算
    getSpecialtyBonus(cityId, goodId) {
        const city = cities.find(c => c.id === cityId);
        if (!city || !city.specialties.includes(goodId)) return 1;

        return city.bonusMultiplier;
    }
};

// グローバルに公開
window.cities = cities;
window.CityManager = CityManager;