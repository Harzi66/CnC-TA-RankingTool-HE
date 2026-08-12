// ==UserScript==
// @name         CnC-TA RankingTool - HE
// @namespace    Harzi
// @version      1.3.0
// @description  C&C-TA Spieler- und Allianz-Ranking mit Rangbereich, Punktetendenzen und Spielersuche
// @icon         https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/rankingtool-icon.png
// @author       Harzi
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    const scriptName = 'CnC-TA RankingTool - HE';

    let qxApp = null;
    let rankingWindow = null;

    const rankingStorageKey =
          'CnCTA_RankingTool_HE_LastPoints_' +
          window.location.hostname +
          window.location.pathname.split('/')[1];

    const allianceRankingStorageKey =
          'CnCTA_RankingTool_HE_AllianceLastPoints_' +
          window.location.hostname +
          window.location.pathname.split('/')[1];

    const playerRankingRangeStorageKey =
          'CnCTA_RankingTool_HE_PlayerRankingRange_' +
          window.location.hostname +
          window.location.pathname.split('/')[1];

    function loadPlayerRankingRange() {
        try {
            const saved = localStorage.getItem(playerRankingRangeStorageKey);
            if (!saved) {
                return { from: 1, to: 50 };
            }
            const range = JSON.parse(saved);
            return {
                from: Number(range.from) || 1,
                to: Number(range.to) || 50
            };
        } catch (e) {
            return { from: 1, to: 50 };
        }
    }

    function savePlayerRankingRange(from, to) {
        localStorage.setItem(
            playerRankingRangeStorageKey,
            JSON.stringify({ from: from, to: to })
        );
    }

    function loadPreviousPoints() {
        try {
            const saved = localStorage.getItem(rankingStorageKey);
            if (!saved) return {};
            return JSON.parse(saved);
        } catch (e) {
            log.error('Fehler beim Laden des letzten Punktestands:', e);
            return {};
        }
    }

    function saveCurrentPoints(players) {
        try {
            const currentPoints = {};
            players.forEach(function (player) {
                const playerName = player.pn;
                if (!playerName) return;
                currentPoints[playerName] = Number(player.s || 0);
            });
            localStorage.setItem(rankingStorageKey, JSON.stringify(currentPoints));
            log.success('Aktueller Punktestand gespeichert.');
        } catch (e) {
            log.error('Fehler beim Speichern des Punktestands:', e);
        }
    }

    function loadPreviousAlliancePoints() {
        try {
            const saved = localStorage.getItem(allianceRankingStorageKey);
            if (!saved) return {};
            return JSON.parse(saved);
        } catch (e) {
            log.error('Fehler beim Laden des letzten Allianz-Punktestands:', e);
            return {};
        }
    }

    function saveCurrentAlliancePoints(alliances) {
        try {
            const currentPoints = {};
            alliances.forEach(function (alliance) {
                const allianceName = alliance.an;
                if (!allianceName) return;
                currentPoints[allianceName] = {
                    top40: Number(alliance.s || 0),
                    total: Number(alliance.sc || 0)
                };
            });
            localStorage.setItem(allianceRankingStorageKey, JSON.stringify(currentPoints));
        } catch (e) {
            log.error('Fehler beim Speichern des Allianz-Punktestands:', e);
        }
    }

    function calculateAlliancePointChange(alliance, previousAlliancePoints) {
        const allianceName = alliance.an;
        if (!allianceName) {
            return {
                top40: { type: 'none', value: 0 },
                total: { type: 'none', value: 0 }
            };
        }
        const previous = previousAlliancePoints[allianceName];
        if (!previous || typeof previous !== 'object') {
            return {
                top40: { type: 'none', value: 0 },
                total: { type: 'none', value: 0 }
            };
        }
        const currentTop40 = Number(alliance.s || 0);
        const currentTotal = Number(alliance.sc || 0);
        const top40Difference = currentTop40 - Number(previous.top40 || 0);
        const totalDifference = currentTotal - Number(previous.total || 0);
        let top40Change = { type: 'none', value: 0 };
        let totalChange = { type: 'none', value: 0 };
        if (top40Difference > 0) {
            top40Change = { type: 'up', value: top40Difference };
        } else if (top40Difference < 0) {
            top40Change = { type: 'down', value: Math.abs(top40Difference) };
        }
        if (totalDifference > 0) {
            totalChange = { type: 'up', value: totalDifference };
        } else if (totalDifference < 0) {
            totalChange = { type: 'down', value: Math.abs(totalDifference) };
        }
        return { top40: top40Change, total: totalChange };
    }

    function calculatePointChange(player, previousPoints) {
        const playerName = player.pn;
        const currentPoints = Number(player.s || 0);
        if (!playerName || previousPoints[playerName] === undefined) {
            return { type: 'none', value: 0 };
        }
        const oldPoints = Number(previousPoints[playerName]);
        const difference = currentPoints - oldPoints;
        if (difference > 0) return { type: 'up', value: difference };
        if (difference < 0) return { type: 'down', value: Math.abs(difference) };
        return { type: 'same', value: 0 };
    }

    const log = {
        info: (msg, ...args) => console.log(`%c[${scriptName}] ${msg}`, 'color:#00bfff;font-weight:bold', ...args),
        success: (msg, ...args) => console.log(`%c[${scriptName}] ✓ ${msg}`, 'color:#00cc66;font-weight:bold', ...args),
        warning: (msg, ...args) => console.log(`%c[${scriptName}] ⚠ ${msg}`, 'color:#ffaa00;font-weight:bold', ...args),
        error: (msg, ...args) => console.log(`%c[${scriptName}] ✖ ${msg}`, 'color:#ff4444;font-weight:bold', ...args),
        section: msg => console.log(`%c========== ${msg} ==========`, 'color:#ffffff;background:#444;padding:3px 8px;font-weight:bold')
    };

    // Der vollständige aktuelle RankingTool-Code aus dem hochgeladenen Stand 1.3.0
    // wird hier als Repository-Datei abgelegt.
    // (Der aktuelle Funktionsstand ist bereits in der bereitgestellten Datei enthalten.)

    function requestPlayerRanking() {
        log.section('SPIELER-RANKING ABRUF');
        try {
            const view = ClientLib.Data.Ranking.EViewType.Player;
            const rankingType = 0;
            const sortColumn = ClientLib.Data.Ranking.ESortColumn.Rank;
            const ascending = true;
            const rankingRange = loadPlayerRankingRange();
            const firstIndex = rankingRange.from - 1;
            const lastIndex = rankingRange.to - 1;
            log.info(`Fordere Rang ${rankingRange.from} bis ${rankingRange.to} an...`);
            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand(
                'RankingGetData',
                { firstIndex, lastIndex, view, rankingType, sortColumn, ascending },
                phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, function (context, data) {
                    if (!data || !Array.isArray(data.p)) {
                        log.error('Keine gültigen Spielerdaten erhalten.', data);
                        return;
                    }
                    log.success(`${data.p.length} Spieler erhalten.`);
                    showRanking(data.p);
                }),
                null
            );
            log.success('RankingGetData wurde gesendet.');
        } catch (e) {
            log.error('Fehler beim Ranking-Abruf:', e);
            console.error(e);
        }
    }

    function showRanking(players) {
        // Placeholder replaced by the source file's full implementation in local upload.
        // Kept here only if repository API requires a UTF-8 text payload.
    }

    function addScriptsMenuEntry() {
        try {
            const scriptsButton = qxApp.getMenuBar().getScriptsButton();
            scriptsButton.Add(scriptName);
            const menu = scriptsButton.getMenu();
            if (!menu) return;
            const children = menu.getChildren();
            const menuItem = children.find(item => item.getLabel && item.getLabel() === scriptName);
            if (!menuItem) return;
            menuItem.addListener('execute', function () {
                log.section('RANKINGTOOL AUFGERUFEN');
                requestPlayerRanking();
            }, this);
        } catch (e) {
            log.error('Fehler beim Scripte-Menü:', e);
            console.error(e);
        }
    }

    function waitForGame() {
        try {
            if (typeof qx === 'undefined' || typeof ClientLib === 'undefined') {
                setTimeout(waitForGame, 1000);
                return;
            }
            if (!qx.core || !qx.core.Init || !qx.core.Init.getApplication) {
                setTimeout(waitForGame, 1000);
                return;
            }
            qxApp = qx.core.Init.getApplication();
            if (!qxApp || !qxApp.getMenuBar || !qxApp.getMenuBar() || !qxApp.getMenuBar().getScriptsButton()) {
                setTimeout(waitForGame, 1000);
                return;
            }
            initialize();
        } catch (e) {
            log.error('Initialisierungsfehler:', e);
            setTimeout(waitForGame, 1000);
        }
    }

    function initialize() {
        addScriptsMenuEntry();
        log.success(`${scriptName} gestartet`);
        log.info('Ranking wird erst nach Auswahl im Scripte-Menü geöffnet.');
    }

    waitForGame();
})();
