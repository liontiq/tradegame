// セーブ管理システム
const SaveManager = {
    // セーブデータのキー
    SAVE_KEY: 'tradeFleetSaveData',

    // ゲームデータの保存
    saveGame() {
        const saveData = {
            gameState: gameState,
            marketData: MarketManager.marketData,
            cities: cities,
            version: '1.0.0'
        };

        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('セーブに失敗しました:', error);
            return false;
        }
    },

    // ゲームデータのロード
    loadGame() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) return false;

            const data = JSON.parse(savedData);
            
            // バージョンチェック（将来の互換性のため）
            if (data.version !== '1.0.0') {
                console.warn('セーブデータのバージョンが異なります');
            }

            // データの復元
            gameState = data.gameState;
            MarketManager.marketData = data.marketData;
            
            // 都市データの更新（投資額と成長レベルのみ）
            data.cities.forEach(savedCity => {
                const city = cities.find(c => c.id === savedCity.id);
                if (city) {
                    city.investments = savedCity.investments;
                    city.growthLevel = savedCity.growthLevel;
                }
            });

            return true;
        } catch (error) {
            console.error('ロードに失敗しました:', error);
            return false;
        }
    },

    // セーブデータの削除（リセット用）
    clearSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            return true;
        } catch (error) {
            console.error('セーブデータの削除に失敗しました:', error);
            return false;
        }
    },

    // JSON形式でエクスポート
    exportSave() {
        const saveData = {
            gameState: gameState,
            marketData: MarketManager.marketData,
            cities: cities,
            version: '1.0.0',
            exportDate: new Date().toISOString()
        };

        const dataStr = 'data:text/json;charset=utf-8,' + 
            encodeURIComponent(JSON.stringify(saveData, null, 2));
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', 'tradeFleeSave.json');
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    // JSONファイルからインポート
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.version || !data.gameState) {
                        reject('無効なセーブデータです');
                        return;
                    }

                    gameState = data.gameState;
                    MarketManager.marketData = data.marketData;
                    
                    data.cities.forEach(savedCity => {
                        const city = cities.find(c => c.id === savedCity.id);
                        if (city) {
                            city.investments = savedCity.investments;
                            city.growthLevel = savedCity.growthLevel;
                        }
                    });

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject('ファイルの読み込みに失敗しました');
            reader.readAsText(file);
        });
    }
};

// グローバルに公開
window.SaveManager = SaveManager;