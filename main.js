// ゲームの状態管理
let gameState = {
    day: 1,
    money: 1000,
    currentCity: 'リスボン',
    ships: [],
    activeShipIndex: 0,
    logs: []
};

// 船の種類データ
const shipTypes = [
    {
        id: 'small_trader',
        name: '小型商船',
        description: '一般的な貿易船。基本的な性能を持つ。',
        capacity: 100,
        speedFactor: 1.0,
        cost: 1000,
        durability: 100,
        icon: '⛵'
    },
    {
        id: 'medium_trader',
        name: '中型商船',
        description: 'より大きな貨物室を持つ頑丈な船。',
        capacity: 200,
        speedFactor: 0.9,
        cost: 3000,
        durability: 150,
        icon: '⛵'
    },
    {
        id: 'large_trader',
        name: '大型商船',
        description: '大量の貨物を運べる大型の貿易船。',
        capacity: 300,
        speedFactor: 0.85,
        cost: 6000,
        durability: 200,
        icon: '🚢'
    }
];

// UI要素の参照を取得
const dayDisplay = document.getElementById('day-display');
const moneyDisplay = document.getElementById('money-display');
const locationDisplay = document.getElementById('location-display');
const activeShipDisplay = document.getElementById('active-ship-display');
const citiesList = document.getElementById('cities-list');
const marketBody = document.getElementById('market-body');
const cargoBody = document.getElementById('cargo-body');
const cargoCapacity = document.getElementById('cargo-capacity');
const maxCargoCapacity = document.getElementById('max-cargo-capacity');
const advanceDayBtn = document.getElementById('advance-day-btn');
const gameLog = document.getElementById('game-log');

// 船の作成関数
function createShip(typeId) {
    const shipType = shipTypes.find(type => type.id === typeId);
    if (!shipType) return null;

    return {
        typeId: typeId,
        name: shipType.name,
        capacity: shipType.capacity,
        speedFactor: shipType.speedFactor,
        durability: shipType.durability,
        currentCapacity: 0,
        cargo: []
    };
}

// 現在の船を取得
function getActiveShip() {
    return gameState.ships[gameState.activeShipIndex];
}

// ログメッセージを追加
function addLogMessage(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<strong>Day ${gameState.day}:</strong> ${message}`;
    gameLog.prepend(logEntry);

    while (gameLog.children.length > 100) {
        gameLog.removeChild(gameLog.lastChild);
    }
}

// UIの更新
function updateUI() {
    const activeShip = getActiveShip();

    dayDisplay.textContent = `日数: ${gameState.day}`;
    moneyDisplay.textContent = `所持金: ${gameState.money} 金貨`;
    locationDisplay.textContent = `現在地: ${gameState.currentCity}`;
    activeShipDisplay.textContent = `使用中: ${activeShip.name}`;

    renderCities();
    renderMarket();
    renderCargo();
}

// 商品の購入
function buyGoods(goodId, quantity) {
    const currentCityId = cities.find(c => c.name === gameState.currentCity).id;
    const market = MarketManager.marketData[currentCityId][goodId];
    const good = goods.find(g => g.id === goodId);
    const activeShip = getActiveShip();

    if (!market || !good) return;

    // 在庫確認
    if (market.quantity < quantity) {
        addLogMessage(`${good.name}の在庫が足りません`);
        return;
    }

    // 貨物容量確認
    const requiredCapacity = good.weight * quantity;
    if (activeShip.currentCapacity + requiredCapacity > activeShip.capacity) {
        addLogMessage(`貨物容量が足りません`);
        return;
    }

    // 所持金確認
    const totalCost = market.buyPrice * quantity;
    if (gameState.money < totalCost) {
        addLogMessage(`所持金が足りません`);
        return;
    }

    // 購入処理
    gameState.money -= totalCost;
    market.quantity -= quantity;
    activeShip.currentCapacity += requiredCapacity;

    // 既存の貨物に追加または新規作成
    const existingCargo = activeShip.cargo.find(item => item.id === goodId);
    if (existingCargo) {
        existingCargo.quantity += quantity;
    } else {
        activeShip.cargo.push({
            id: goodId,
            quantity: quantity,
            purchasePrice: market.buyPrice,
            daysHeld: 0
        });
    }

    updateUI();
    addLogMessage(`${good.name}を${quantity}個、${totalCost}金貨で購入しました`);

    SaveManager.saveGame(); // 自動セーブ
}

// 商品の販売
function sellGoods(goodId, quantity) {
    const currentCityId = cities.find(c => c.name === gameState.currentCity).id;
    const market = MarketManager.marketData[currentCityId][goodId];
    const good = goods.find(g => g.id === goodId);
    const activeShip = getActiveShip();
    const cargo = activeShip.cargo.find(item => item.id === goodId);

    if (!cargo || cargo.quantity < quantity) {
        addLogMessage(`${good.name}の在庫が足りません`);
        return;
    }

    const earnings = market.sellPrice * quantity;
    gameState.money += earnings;
    cargo.quantity -= quantity;
    activeShip.currentCapacity -= good.weight * quantity;

    if (cargo.quantity <= 0) {
        activeShip.cargo = activeShip.cargo.filter(item => item.id !== goodId);
    }

    updateUI();
    addLogMessage(`${good.name}を${quantity}個、${earnings}金貨で販売しました`);

    SaveManager.saveGame(); // 自動セーブ
}

// ゲームの初期化
function initGame() {
    gameState = {
        day: 1,
        money: 1000,
        currentCity: 'リスボン',
        ships: [createShip('small_trader')],
        activeShipIndex: 0,
        logs: []
    };

    MarketManager.initializeMarkets();
    updateUI();
    addLogMessage('新しいゲームを開始しました');
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    // セーブデータがあればロード、なければ新規ゲーム
    if (!SaveManager.loadGame()) {
        initGame();
    } else {
        updateUI();
        addLogMessage('セーブデータをロードしました');
    }

    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // 次の日へボタン
    document.getElementById('advance-day-btn').addEventListener('click', () => {
        gameState.day++;
        MarketManager.updateMarkets();
        updateUI();
        addLogMessage('1日が経過しました');
        SaveManager.saveGame();
    });

    // セーブ関連のボタン
    document.getElementById('save-game-btn').addEventListener('click', () => {
        if (SaveManager.saveGame()) {
            addLogMessage('ゲームをセーブしました');
        }
    });

    document.getElementById('load-game-btn').addEventListener('click', () => {
        if (SaveManager.loadGame()) {
            updateUI();
            addLogMessage('ゲームをロードしました');
        }
    });

    document.getElementById('reset-game-btn').addEventListener('click', () => {
        if (confirm('本当にリセットしますか？進行状況は失われます')) {
            SaveManager.clearSave();
            initGame();
        }
    });
});

// 30秒ごとの自動セーブ
setInterval(() => SaveManager.saveGame(), 30000);