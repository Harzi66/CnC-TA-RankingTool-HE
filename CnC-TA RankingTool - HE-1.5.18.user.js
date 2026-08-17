// ==UserScript==
// @name         CnC-TA RankingTool - HE
// @namespace    Harzi
// @version      1.5.18
// @description  C&C-TA Spieler-, Allianz- und Daily-Ranking mit Rangbereich, Spielersuche und Tages-Snapshot
// @icon         https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/rankingtool-icon.png
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/CnC-TA-RankingTool-HE.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/CnC-TA-RankingTool-HE.user.js
// @author       Harzi
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        none
// ==/UserScript==

// Neu in Version 1.5.18
// Startreihenfolge neu festgelegt
// Tooltips hinzugefügt
// Spielersuche in Bereich "Daily-Snapshot" hinzugefpgt
// Löschbutton für Sucheintrag hinzugefügt
// verschiedene Textanpassungen

(function () {
    'use strict';

    const scriptName = 'CnC-TA RankingTool - HE';

    let qxApp = null;
    let rankingWindow = null;
    let snapshotStatusLabel = null;
    let snapshotTimer = null;
    let dailyRankingRefreshCallback = null;

    // =========================================================
    // PUNKTEVERGLEICH
    // =========================================================

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

            const saved =
                  localStorage.getItem(
                      playerRankingRangeStorageKey
                  );

            if (!saved) {

                return {
                    from: 1,
                    to: 50
                };
            }

            const range =
                  JSON.parse(saved);

            return {
                from: Number(range.from) || 1,
                to: Number(range.to) || 50
            };

        } catch (e) {

            return {
                from: 1,
                to: 50
            };
        }
    }


    function savePlayerRankingRange(
    from,
     to
    ) {

        localStorage.setItem(
            playerRankingRangeStorageKey,
            JSON.stringify({
                from: from,
                to: to
            })
        );
    }

    function loadPreviousPoints() {

        try {

            const saved =
                  localStorage.getItem(
                      rankingStorageKey
                  );

            if (!saved) {
                return {};
            }

            return JSON.parse(saved);

        } catch (e) {

            log.error(
                'Fehler beim Laden des letzten Punktestands:',
                e
            );

            return {};
        }
    }


    function saveCurrentPoints(players) {

        try {

            const currentPoints = {};

            players.forEach(
                function (player) {

                    const playerName =
                          player.pn;

                    if (!playerName) {
                        return;
                    }

                    currentPoints[playerName] =
                        Number(player.s || 0);
                }
            );

            localStorage.setItem(
                rankingStorageKey,
                JSON.stringify(currentPoints)
            );

            log.success(
                'Aktueller Punktestand gespeichert.'
            );

        } catch (e) {

            log.error(
                'Fehler beim Speichern des Punktestands:',
                e
            );
        }
    }

    function loadPreviousAlliancePoints() {

        try {

            const saved =
                  localStorage.getItem(
                      allianceRankingStorageKey
                  );

            if (!saved) {
                return {};
            }

            return JSON.parse(saved);

        } catch (e) {

            log.error(
                'Fehler beim Laden des letzten Allianz-Punktestands:',
                e
            );

            return {};
        }
    }


    function saveCurrentAlliancePoints(alliances) {

        try {

            const currentPoints = {};

            alliances.forEach(
                function (alliance) {

                    const allianceName =
                          alliance.an;

                    if (!allianceName) {
                        return;
                    }

                    currentPoints[allianceName] = {

                        top40:
                        Number(alliance.s || 0),

                        total:
                        Number(alliance.sc || 0)

                    };
                }
            );

            localStorage.setItem(
                allianceRankingStorageKey,
                JSON.stringify(currentPoints)
            );

        } catch (e) {

            log.error(
                'Fehler beim Speichern des Allianz-Punktestands:',
                e
            );
        }
    }

    function calculateAlliancePointChange(
    alliance,
     previousAlliancePoints
    ) {

        const allianceName =
              alliance.an;

        if (!allianceName) {

            return {
                top40: {
                    type: 'none',
                    value: 0
                },

                total: {
                    type: 'none',
                    value: 0
                }
            };
        }


        const previous =
              previousAlliancePoints[allianceName];


        // Noch kein Vergleichswert vorhanden
        if (
            !previous ||
            typeof previous !== 'object'
        ) {

            return {
                top40: {
                    type: 'none',
                    value: 0
                },

                total: {
                    type: 'none',
                    value: 0
                }
            };
        }


        const currentTop40 =
              Number(alliance.s || 0);

        const currentTotal =
              Number(alliance.sc || 0);


        const top40Difference =
              currentTop40 -
              Number(previous.top40 || 0);


        const totalDifference =
              currentTotal -
              Number(previous.total || 0);


        let top40Change = {
            type: 'none',
            value: 0
        };


        let totalChange = {
            type: 'none',
            value: 0
        };


        if (top40Difference > 0) {

            top40Change = {
                type: 'up',
                value: top40Difference
            };

        } else if (top40Difference < 0) {

            top40Change = {
                type: 'down',
                value: Math.abs(top40Difference)
            };
        }


        if (totalDifference > 0) {

            totalChange = {
                type: 'up',
                value: totalDifference
            };

        } else if (totalDifference < 0) {

            totalChange = {
                type: 'down',
                value: Math.abs(totalDifference)
            };
        }


        return {

            top40: top40Change,

            total: totalChange
        };
    }

    function calculatePointChange(
    player,
     previousPoints
    ) {

        const playerName =
              player.pn;

        const currentPoints =
              Number(player.s || 0);

        if (
            !playerName ||
            previousPoints[playerName] === undefined
        ) {

            return {
                type: 'none',
                value: 0
            };
        }


        const oldPoints =
              Number(
                  previousPoints[playerName]
              );


        const difference =
              currentPoints - oldPoints;


        if (difference > 0) {

            return {
                type: 'up',
                value: difference
            };

        }


        if (difference < 0) {

            return {
                type: 'down',
                value: Math.abs(difference)
            };

        }


        return {
            type: 'same',
            value: 0
        };
    }


    // =========================================================
    // TAGES-SNAPSHOT
    // =========================================================

    const rankingSnapshotStorageKey =
          'CnCTA_RankingTool_HE_DailySnapshot_' +
          window.location.hostname +
          window.location.pathname.split('/')[1];

    const allianceRankingSnapshotStorageKey =
          'CnCTA_RankingTool_HE_DailyAllianceSnapshot_' +
          window.location.hostname +
          window.location.pathname.split('/')[1];


    const rankingSnapshotSettingsStorageKey =
          'CnCTA_RankingTool_HE_DailySnapshotSettings_' +
          window.location.hostname +
          window.location.pathname.split('/')[1];


    function loadSnapshotSettings() {

        try {

            const saved =
                  localStorage.getItem(
                      rankingSnapshotSettingsStorageKey
                  );

            if (!saved) {

                return {
                    enabled: true,
                    time: '24:00'
                };

            }

            const settings =
                  JSON.parse(saved);

            return {
                enabled: settings.enabled === true,
                time: isValidSnapshotTime(settings.time)
                ? settings.time
                : '24:00'
            };

        } catch (e) {

            log.error(
                'Fehler beim Laden der Snapshot-Einstellungen:',
                e
            );

            return {
                enabled: true,
                time: '24:00'
            };
        }
    }


    function saveSnapshotSettings(
    enabled,
     time
    ) {

        localStorage.setItem(
            rankingSnapshotSettingsStorageKey,
            JSON.stringify({
                enabled: enabled,
                time: time
            })
        );

    }


    function isValidSnapshotTime(
    time
    ) {

        return (
            typeof time === 'string' &&
            /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/.test(
                time
            )
        );
    }


    function getSnapshotMinutes(
    time
    ) {

        if (time === '24:00') {

            return 0;
        }

        const parts =
              time.split(':');

        return (
            Number(parts[0]) * 60 +
            Number(parts[1])
        );
    }


    function formatSnapshotDate(
    date
    ) {

        const year =
              date.getFullYear();

        const month =
              String(
                  date.getMonth() + 1
              ).padStart(2, '0');

        const day =
              String(
                  date.getDate()
              ).padStart(2, '0');

        return (
            year +
            '-' +
            month +
            '-' +
            day
        );
    }


    function formatSnapshotTime(
    date
    ) {

        return (
            String(
                date.getHours()
            ).padStart(2, '0') +
            ':' +
            String(
                date.getMinutes()
            ).padStart(2, '0')
        );
    }


    function loadLatestRankingSnapshot() {

        try {

            const saved =
                  localStorage.getItem(
                      rankingSnapshotStorageKey
                  );

            if (!saved) {

                return null;
            }

            return JSON.parse(
                saved
            );

        } catch (e) {

            log.error(
                'Fehler beim Laden des Tages-Snapshots:',
                e
            );

            return null;
        }
    }


    function saveRankingSnapshot(
    players,
     configuredTime
    ) {

        try {

            const now =
                  new Date();

            const snapshotPlayers = {};

            players
                .slice(0, 100)
                .forEach(
                function (player) {

                    if (!player || !player.pn) {

                        return;
                    }

                    snapshotPlayers[
                        player.pn
                    ] = {
                        rank:
                        Number(player.r || 0),
                        alliance:
                        player.an || '-',
                        points:
                        Number(player.s || 0)
                    };

                }
            );


            const snapshot = {

                date:
                formatSnapshotDate(
                    now
                ),

                time:
                formatSnapshotTime(
                    now
                ),

                configuredTime:
                configuredTime,

                capturedAt:
                now.toISOString(),

                players:
                snapshotPlayers

            };


            localStorage.setItem(
                rankingSnapshotStorageKey,
                JSON.stringify(snapshot)
            );


            updateSnapshotStatusLabel();


            log.success(
                `Tages-Snapshot gespeichert: ${Object.keys(snapshotPlayers).length} Spieler.`
            );


        } catch (e) {

            log.error(
                'Fehler beim Speichern des Tages-Snapshots:',
                e
            );

        }
    }


    function loadLatestAllianceRankingSnapshot() {

        try {
            const saved = localStorage.getItem(
                allianceRankingSnapshotStorageKey
            );

            if (!saved) return null;

            return JSON.parse(saved);

        } catch (e) {
            log.error(
                'Fehler beim Laden des Allianz-Tages-Snapshots:',
                e
            );
            return null;
        }
    }


    function saveAllianceRankingSnapshot(
    alliances,
     configuredTime
    ) {

        try {
            const now = new Date();
            const snapshotAlliances = {};

            alliances
                .slice(0, 25)
                .forEach(function (alliance) {

                if (!alliance || !alliance.an) return;

                snapshotAlliances[alliance.an] = {
                    rank:
                    Number(alliance.r || 0),
                    top40:
                    Number(alliance.s || 0),
                    players:
                    Number(alliance.pc || 0),
                    bases:
                    Number(alliance.bc || 0),
                    total:
                    Number(alliance.sc || 0)
                };
            });

            const snapshot = {
                date: formatSnapshotDate(now),
                time: formatSnapshotTime(now),
                configuredTime: configuredTime,
                capturedAt: now.toISOString(),
                alliances: snapshotAlliances
            };

            localStorage.setItem(
                allianceRankingSnapshotStorageKey,
                JSON.stringify(snapshot)
            );

            log.success(
                `Allianz-Tages-Snapshot gespeichert: ${Object.keys(snapshotAlliances).length} Allianzen.`
            );

        } catch (e) {
            log.error(
                'Fehler beim Speichern des Allianz-Tages-Snapshots:',
                e
            );
        }
    }


    function getAllianceSnapshotPoints(
    alliance
    ) {

        const snapshot = loadLatestAllianceRankingSnapshot();

        if (
            !snapshot ||
            !snapshot.alliances ||
            !alliance ||
            !alliance.an
        ) {
            return null;
        }

        if (snapshot.alliances[alliance.an] === undefined) {
            return null;
        }

        const savedAlliance =
              snapshot.alliances[alliance.an];

        if (
            savedAlliance &&
            typeof savedAlliance === 'object'
        ) {
            return Number(
                savedAlliance.top40 || 0
            );
        }

        // Kompatibilität mit älteren Snapshots
        return Number(
            savedAlliance
        );
    }


    function getSnapshotPoints(
    player
    ) {

        const snapshot =
              loadLatestRankingSnapshot();

        if (
            !snapshot ||
            !snapshot.players ||
            !player ||
            !player.pn
        ) {

            return null;
        }


        if (
            snapshot.players[player.pn] === undefined
        ) {

            return null;
        }


        const savedPlayer =
              snapshot.players[player.pn];

        if (
            savedPlayer &&
            typeof savedPlayer === 'object'
        ) {
            return Number(
                savedPlayer.points || 0
            );
        }

        // Kompatibilität mit älteren Snapshots
        return Number(
            savedPlayer
        );
    }


    function updateSnapshotStatusLabel() {

        if (!snapshotStatusLabel) {

            return;
        }


        const snapshot =
              loadLatestRankingSnapshot();


        if (!snapshot) {

            snapshotStatusLabel.setValue(
                'Letzter Snapshot: noch keiner'
            );

            return;
        }


        snapshotStatusLabel.setValue(
            `Letzter Snapshot: ${snapshot.date} ${snapshot.time}`
        );
    }


    function requestPlayerSnapshot(
    manual
    ) {

        log.section(
            'TAGES-SNAPSHOT ABRUF'
        );


        try {

            const view =
                  ClientLib.Data.Ranking.EViewType.Player;


            const rankingType =
                  0;


            const sortColumn =
                  ClientLib.Data.Ranking.ESortColumn.Rank;


            const ascending =
                  true;


            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendSimpleCommand(

                'RankingGetData',

                {

                    firstIndex: 0,

                    lastIndex: 99,

                    view: view,

                    rankingType: rankingType,

                    sortColumn: sortColumn,

                    ascending: ascending

                },


                phe.cnc.Util.createEventDelegate(

                    ClientLib.Net.CommandResult,

                    this,


                    function (
                    context,
                     data
                    ) {

                        if (
                            !data ||
                            !Array.isArray(data.p)
                        ) {

                            log.error(
                                'Tages-Snapshot: keine gültigen Spielerdaten erhalten.',
                                data
                            );

                            return;
                        }


                        const settings =
                              loadSnapshotSettings();

                        const configuredTime =
                              manual
                        ? formatSnapshotTime(
                            new Date()
                        )
                        : settings.time;


                        saveRankingSnapshot(
                            data.p,
                            configuredTime
                        );

                    }
                ),


                null
            );


            log.info(
                'RankingGetData für Top 100 wurde als Tages-Snapshot gesendet.'
            );


        } catch (e) {

            log.error(
                'Fehler beim Tages-Snapshot-Abruf:',
                e
            );

            console.error(e);
        }
    }


    function requestAllianceSnapshot(
    manual
    ) {

        try {
            const view = ClientLib.Data.Ranking.EViewType.Alliance;
            const rankingType = 0;
            const sortColumn = ClientLib.Data.Ranking.ESortColumn.Rank;
            const ascending = true;

            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendSimpleCommand(
                'RankingGetData',
                {
                    firstIndex: 0,
                    lastIndex: 24,
                    view: view,
                    rankingType: rankingType,
                    sortColumn: sortColumn,
                    ascending: ascending
                },
                phe.cnc.Util.createEventDelegate(
                    ClientLib.Net.CommandResult,
                    this,
                    function (context, data) {

                        if (!data || !Array.isArray(data.a)) {
                            log.error(
                                'Allianz-Tages-Snapshot: keine gültigen Allianz-Daten erhalten.',
                                data
                            );
                            return;
                        }

                        const settings =
                              loadSnapshotSettings();

                        const configuredTime =
                              manual
                        ? formatSnapshotTime(
                            new Date()
                        )
                        : settings.time;

                        saveAllianceRankingSnapshot(
                            data.a,
                            configuredTime
                        );
                    }
                ),
                null
            );

            log.info(
                'RankingGetData für Top 25 Allianzen wurde als Tages-Snapshot gesendet.'
            );

        } catch (e) {
            log.error(
                'Fehler beim Allianz-Tages-Snapshot-Abruf:',
                e
            );
            console.error(e);
        }
    }



    function requestManualSnapshot() {

        log.section(
            'MANUELLER SNAPSHOT ABRUF'
        );

        requestPlayerSnapshot(true);
        requestAllianceSnapshot(true);

        log.success(
            'Manueller Snapshot für Top 100 Spieler und Top 25 Allianzen angefordert.'
        );
    }


    // =========================================================
    // AKTUELLES DAILY-RANKING ABRUFEN
    // =========================================================

    function requestDailyPlayerRanking(onSuccess) {

        try {

            const view =
                  ClientLib.Data.Ranking.EViewType.Player;

            const rankingType = 0;

            const sortColumn =
                  ClientLib.Data.Ranking.ESortColumn.Rank;

            const ascending = true;

            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendSimpleCommand(

                'RankingGetData',

                {
                    firstIndex: 0,
                    lastIndex: 99,
                    view: view,
                    rankingType: rankingType,
                    sortColumn: sortColumn,
                    ascending: ascending
                },

                phe.cnc.Util.createEventDelegate(
                    ClientLib.Net.CommandResult,
                    this,
                    function (context, data) {

                        if (
                            !data ||
                            !Array.isArray(data.p)
                        ) {
                            log.error(
                                'Daily-Ranking: keine aktuellen Spielerdaten erhalten.',
                                data
                            );
                            return;
                        }

                        if (
                            typeof onSuccess === 'function'
                        ) {
                            onSuccess(data.p);
                        }
                    }
                ),

                null
            );

        } catch (e) {

            log.error(
                'Fehler beim aktuellen Daily-Spieler-Ranking:',
                e
            );
        }
    }


    function requestDailyAllianceRanking(onSuccess) {

        try {

            const view =
                  ClientLib.Data.Ranking.EViewType.Alliance;

            const rankingType = 0;

            const sortColumn =
                  ClientLib.Data.Ranking.ESortColumn.Rank;

            const ascending = true;

            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendSimpleCommand(

                'RankingGetData',

                {
                    firstIndex: 0,
                    lastIndex: 24,
                    view: view,
                    rankingType: rankingType,
                    sortColumn: sortColumn,
                    ascending: ascending
                },

                phe.cnc.Util.createEventDelegate(
                    ClientLib.Net.CommandResult,
                    this,
                    function (context, data) {

                        if (
                            !data ||
                            !Array.isArray(data.a)
                        ) {
                            log.error(
                                'Daily-Ranking: keine aktuellen Allianz-Daten erhalten.',
                                data
                            );
                            return;
                        }

                        if (
                            typeof onSuccess === 'function'
                        ) {
                            onSuccess(data.a);
                        }
                    }
                ),

                null
            );

        } catch (e) {

            log.error(
                'Fehler beim aktuellen Daily-Allianz-Ranking:',
                e
            );
        }
    }


    function scheduleNextSnapshot() {

        if (snapshotTimer) {

            clearTimeout(
                snapshotTimer
            );

            snapshotTimer = null;
        }


        const settings =
              loadSnapshotSettings();


        if (!settings.enabled) {

            log.info(
                'Automatischer Tages-Snapshot ist deaktiviert.'
            );

            return;
        }


        const now =
              new Date();


        const targetMinutes =
              getSnapshotMinutes(
                  settings.time
              );


        const target =
              new Date(
                  now
              );


        target.setHours(
            Math.floor(
                targetMinutes / 60
            ),
            targetMinutes % 60,
            0,
            0
        );


        if (
            target.getTime() <= now.getTime()
        ) {

            target.setDate(
                target.getDate() + 1
            );
        }


        const delay =
              target.getTime() -
              now.getTime();


        snapshotTimer =
            setTimeout(
            function () {

                requestPlayerSnapshot();

                requestAllianceSnapshot();

                scheduleNextSnapshot();

            },
            delay
        );


        log.info(
            `Nächster Tages-Snapshot: ${target.toLocaleString('de-DE')}`
        );
    }


    // =========================================================
    // FARBIGE LOGGER
    // =========================================================

    const log = {

        info: (msg, ...args) =>
        console.log(
            `%c[${scriptName}] ${msg}`,
            'color:#00bfff;font-weight:bold',
            ...args
        ),

        success: (msg, ...args) =>
        console.log(
            `%c[${scriptName}] ✓ ${msg}`,
            'color:#00cc66;font-weight:bold',
            ...args
        ),

        warning: (msg, ...args) =>
        console.log(
            `%c[${scriptName}] ⚠ ${msg}`,
            'color:#ffaa00;font-weight:bold',
            ...args
        ),

        error: (msg, ...args) =>
        console.log(
            `%c[${scriptName}] ✖ ${msg}`,
            'color:#ff4444;font-weight:bold',
            ...args
        ),

        section: msg =>
        console.log(
            `%c========== ${msg} ==========`,
            'color:#ffffff;background:#444;padding:3px 8px;font-weight:bold'
        )
    };


    // =========================================================
    // RANKING-FENSTER
    // =========================================================

    function showRanking(players, startView) {

        log.section('RANKING ANZEIGE');

        const previousPoints =
              loadPreviousPoints();

        let dailyPlayerModel = null;
        let dailyAllianceModel = null;

        let dailyCurrentPlayers = [];
        let dailyCurrentAlliances = [];


        // -----------------------------------------------------
        // Vorhandenes Fenster schließen
        // -----------------------------------------------------

        if (rankingWindow) {

            try {
                rankingWindow.close();
            } catch (e) {
                // nichts
            }

            rankingWindow = null;
        }


        // -----------------------------------------------------
        // C&C-TA NATIVES FENSTER
        // -----------------------------------------------------

        rankingWindow =
            new qx.ui.window.Window(
            'CnC-TA RankingTool - HE'
        );


        rankingWindow.set({

            width: 760,

            height: 650,

            allowMaximize: true,

            allowMinimize: true,

            showMaximize: true,

            showMinimize: true,

            showStatusbar: false,

            resizable: true,

            contentPadding: 0
        });

        rankingWindow =
            new qx.ui.window.Window(
            'CnC-TA RankingTool - HE'
        );

        rankingWindow.set({

            width: 760,
            height: 650,

            allowMaximize: true,
            allowMinimize: true,
            showMaximize: true,
            showMinimize: true,

            showStatusbar: false,

            resizable: true,

            contentPadding: 0
        });

        rankingWindow.setLayout(
            new qx.ui.layout.VBox(0)
        );

        // -----------------------------------------------------
        // Hauptlayout
        // -----------------------------------------------------

        const mainContainer =
              new qx.ui.container.Composite(
                  new qx.ui.layout.VBox(0)
              );


        mainContainer.set({
            padding: 8
        });

        // =====================================================
        // RANKING-REITER
        // =====================================================

        const tabBar =
              new qx.ui.container.Composite(
                  new qx.ui.layout.HBox(4)
              );


        // -----------------------------------------------------
        // Spieler-Ranking
        // -----------------------------------------------------

        const playerTab =
              new qx.ui.form.Button(
                  'Spieler-Ranking'
              );

        playerTab.set({
            width: 150,
            height: 28
        });


        playerTab.addListener(
            'execute',
            function () {

                rangeContainer.setVisibility(
                    'visible'
                );

                snapshotContainer.setVisibility(
                    'excluded'
                );

                dailyContent.setVisibility(
                    'excluded'
                );

                rankingContent.setVisibility(
                    'visible'
                );

                requestPlayerRanking('player');

            }
        );


        // -----------------------------------------------------
        // Allianz-Ranking
        // -----------------------------------------------------

        const allianceTab =
              new qx.ui.form.Button(
                  'Allianz-Ranking'
              );

        allianceTab.set({
            width: 150,
            height: 28
        });


        // -----------------------------------------------------
        // Daily-Ranking
        // -----------------------------------------------------

        const dailyTab =
              new qx.ui.form.Button(
                  'Daily-Ranking'
              );

        dailyTab.set({
            width: 150,
            height: 28
        });


        dailyTab.addListener(
            'execute',
            function () {

                rangeContainer.setVisibility(
                    'excluded'
                );

                snapshotContainer.setVisibility(
                    'visible'
                );

                rankingContent.setVisibility(
                    'excluded'
                );

                dailyContent.setVisibility(
                    'visible'
                );

                updateSnapshotStatusLabel();

                requestDailyPlayerRanking(
                    function (players) {

                        dailyCurrentPlayers =
                            players || [];

                        renderDailyRanking();
                    }
                );

                requestDailyAllianceRanking(
                    function (alliances) {

                        dailyCurrentAlliances =
                            alliances || [];

                        renderDailyRanking();
                    }
                );

                renderDailyRanking();

            }
        );


        tabBar.add(playerTab);
        tabBar.add(allianceTab);
        tabBar.add(dailyTab);

        allianceTab.addListener(
            'execute',
            function () {

                rangeContainer.setVisibility(
                    'excluded'
                );

                snapshotContainer.setVisibility(
                    'excluded'
                );

                dailyContent.setVisibility(
                    'excluded'
                );

                rankingContent.setVisibility(
                    'visible'
                );

                requestAllianceRanking(
                    function (alliances) {

                        const previousAlliancePoints =
                              loadPreviousAlliancePoints();

                        // -------------------------------------------------
                        // Vorhandene Anzeige entfernen
                        // -------------------------------------------------

                        rankingContent.removeAll();


                        // -------------------------------------------------
                        // Allianz-Tabelle
                        // -------------------------------------------------

                        const allianceModel =
                              new qx.ui.table.model.Simple();


                        allianceModel.setColumns([
                            'Rang',
                            'Allianz',
                            'Top 40-Punkte',
                            '',
                            'Änderung',
                            'Spieler',
                            'Basen',
                            'Gesamtpunkte',
                            '',
                            'Änderung'
                        ]);


                        const allianceData =
                              alliances.map(
                                  function (alliance) {

                                      const change =
                                            calculateAlliancePointChange(
                                                alliance,
                                                previousAlliancePoints
                                            );


                                      let top40Arrow = '—';
                                      let top40Change = '';


                                      if (
                                          change.top40.type === 'up'
                                      ) {

                                          top40Arrow = '▲';

                                          top40Change =
                                              change.top40.value
                                              .toLocaleString('de-DE');

                                      }


                                      if (
                                          change.top40.type === 'down'
                                      ) {

                                          top40Arrow = '▼';

                                          top40Change =
                                              change.top40.value
                                              .toLocaleString('de-DE');

                                      }


                                      let totalArrow = '—';
                                      let totalChange = '';


                                      if (
                                          change.total.type === 'up'
                                      ) {

                                          totalArrow = '▲';

                                          totalChange =
                                              change.total.value
                                              .toLocaleString('de-DE');

                                      }


                                      if (
                                          change.total.type === 'down'
                                      ) {

                                          totalArrow = '▼';

                                          totalChange =
                                              change.total.value
                                              .toLocaleString('de-DE');

                                      }


                                      return [

                                          alliance.r,

                                          alliance.an || '-',

                                          Number(
                                              alliance.s || 0
                                          ).toLocaleString('de-DE'),

                                          top40Arrow,

                                          top40Change,

                                          Number(
                                              alliance.pc || 0
                                          ).toLocaleString('de-DE'),

                                          Number(
                                              alliance.bc || 0
                                          ).toLocaleString('de-DE'),

                                          Number(
                                              alliance.sc || 0
                                          ).toLocaleString('de-DE'),

                                          totalArrow,

                                          totalChange

                                      ];

                                  }
                              );

                        allianceModel.setData(
                            allianceData
                        );


                        // -------------------------------------------------
                        // Tabelle erzeugen
                        // -------------------------------------------------

                        const allianceTable =
                              new qx.ui.table.Table(
                                  allianceModel
                              );


                        allianceTable.set({

                            width: 730,

                            height: 560,

                            decorator: 'main',

                            showCellFocusIndicator: false

                        });


                        // -------------------------------------------------
                        // Spaltenbreiten
                        // -------------------------------------------------

                        const allianceColumnModel =
                              allianceTable.getTableColumnModel();


                        // Rang
                        allianceColumnModel.setColumnWidth(
                            0,
                            45
                        );


                        // Allianz
                        allianceColumnModel.setColumnWidth(
                            1,
                            135
                        );


                        // Top 40-Punkte
                        allianceColumnModel.setColumnWidth(
                            2,
                            110
                        );


                        // Top 40 Pfeil
                        allianceColumnModel.setColumnWidth(
                            3,
                            28
                        );


                        // Top 40 Änderung
                        allianceColumnModel.setColumnWidth(
                            4,
                            70
                        );


                        // Spieler
                        allianceColumnModel.setColumnWidth(
                            5,
                            55
                        );


                        // Basen
                        allianceColumnModel.setColumnWidth(
                            6,
                            55
                        );


                        // Gesamtpunkte
                        allianceColumnModel.setColumnWidth(
                            7,
                            115
                        );


                        // Gesamtpunkte Pfeil
                        allianceColumnModel.setColumnWidth(
                            8,
                            28
                        );


                        // Gesamtpunkte Änderung
                        allianceColumnModel.setColumnWidth(
                            9,
                            70
                        );

                        const allianceArrowRenderer =
                              new qx.ui.table.cellrenderer.Default();

                        allianceArrowRenderer._getCellStyle =
                            function (cellInfo) {

                            const value =
                                  String(cellInfo.value || '');

                            if (value === '▲') {

                                return [
                                    'color:#00cc66',
                                    'font-weight:bold',
                                    'text-align:center'
                                ].join(';') + ';';
                            }

                            if (value === '▼') {

                                return [
                                    'color:#ff4444',
                                    'font-weight:bold',
                                    'text-align:center'
                                ].join(';') + ';';
                            }

                            return [
                                'color:#888888',
                                'font-weight:bold',
                                'text-align:center'
                            ].join(';') + ';';
                        };

                        allianceColumnModel.setDataCellRenderer(
                            3,
                            allianceArrowRenderer
                        );

                        allianceColumnModel.setDataCellRenderer(
                            8,
                            allianceArrowRenderer
                        );

                        // -------------------------------------------------
                        // Statuszeile
                        // -------------------------------------------------

                        allianceTable.setAdditionalStatusBarText(
                            `${alliances.length} Allianzen angezeigt`
                );


                        // -------------------------------------------------
                        // Tabelle anzeigen
                        // -------------------------------------------------

                        rankingContent.add(
                            allianceTable,
                            {
                                flex: 1
                            }
                        );

                        saveCurrentAlliancePoints(
                            alliances
                        );
                    }
                );

            }
        );

        // Reiter oben einbauen
        mainContainer.add(
            tabBar
        );


        // =====================================================
        // SPIELER-RANKING - RANGBEREICH
        // =====================================================

        const playerRankingRange =
              loadPlayerRankingRange();


        const rangeContainer =
              new qx.ui.container.Composite(
                  new qx.ui.layout.HBox(8)
              );


        rangeContainer.set({
            paddingTop: 6,
            paddingBottom: 6
        });


        // -----------------------------------------------------
        // Von Rang
        // -----------------------------------------------------

        const fromLabel =
              new qx.ui.basic.Label(
                  'Von Rang:'
              );


        const fromField =
              new qx.ui.form.TextField(
                  String(playerRankingRange.from)
              );


        fromField.set({
            width: 55,
            height: 26
        });


        // -----------------------------------------------------
        // Bis Rang
        // -----------------------------------------------------

        const toLabel =
              new qx.ui.basic.Label(
                  'Bis Rang:'
              );


        const toField =
              new qx.ui.form.TextField(
                  String(playerRankingRange.to)
              );


        toField.set({
            width: 55,
            height: 26
        });


        // -----------------------------------------------------
        // Speichern
        // -----------------------------------------------------

        const saveRangeButton =
              new qx.ui.form.Button(
                  'Aktualisieren'
              );


        saveRangeButton.set({
            width: 85,
            height: 26
        });


        saveRangeButton.addListener(
            'execute',
            function () {

                let from =
                    parseInt(
                        fromField.getValue(),
                        10
                    );

                let to =
                    parseInt(
                        toField.getValue(),
                        10
                    );


                // -------------------------------------------------
                // Eingaben prüfen
                // -------------------------------------------------

                if (
                    isNaN(from) ||
                    isNaN(to)
                ) {

                    from = 1;
                    to = 50;

                    fromField.setValue('1');
                    toField.setValue('50');
                }


                from =
                    Math.max(
                    1,
                    Math.min(
                        1000,
                        from
                    )
                );


                to =
                    Math.max(
                    1,
                    Math.min(
                        1000,
                        to
                    )
                );


                if (from > to) {

                    const temp = from;

                    from = to;
                    to = temp;
                }


                fromField.setValue(
                    String(from)
                );

                toField.setValue(
                    String(to)
                );


                savePlayerRankingRange(
                    from,
                    to
                );
                requestPlayerRanking();
            }
        );


        rangeContainer.add(
            fromLabel
        );

        rangeContainer.add(
            fromField
        );

        rangeContainer.add(
            toLabel
        );

        rangeContainer.add(
            toField
        );

        rangeContainer.add(
            saveRangeButton
        );

        // -----------------------------------------------------
        // Abstand zwischen Rangbereich und Spielersuche
        // -----------------------------------------------------

        const searchSpacer =
              new qx.ui.core.Spacer();

        rangeContainer.add(
            searchSpacer,
            {
                flex: 1
            }
        );


        // -----------------------------------------------------
        // Spielersuche
        // -----------------------------------------------------

        const searchLabel =
              new qx.ui.basic.Label(
                  'Spieler:'
              );


        const searchField =
              new qx.ui.form.TextField();


        searchField.set({
            width: 180,
            height: 26
        });


        const searchButton =
              new qx.ui.form.Button(
                  'Suchen'
              );


        searchButton.set({
            width: 75,
            height: 26
        });


        rangeContainer.add(
            searchLabel
        );

        rangeContainer.add(
            searchField
        );

        rangeContainer.add(
            searchButton
        );


        // -----------------------------------------------------
        // Nur beim Spieler-Ranking anzeigen
        // -----------------------------------------------------

        mainContainer.add(
            rangeContainer
        );


        // =====================================================
        // TAGES-SNAPSHOT EINSTELLUNGEN
        // =====================================================

        const snapshotSettings =
              loadSnapshotSettings();


        const snapshotContainer =
              new qx.ui.container.Composite(
                  new qx.ui.layout.HBox(8)
              );


        snapshotContainer.set({
            paddingTop: 0,
            paddingBottom: 6
        });


        const snapshotAutoCheckBox =
              new qx.ui.form.CheckBox(
                  'Automatik'
              );

        snapshotAutoCheckBox.set({
            textColor: '#ffff00'
        });

        snapshotAutoCheckBox.setToolTipText(
            '<div style="width:180px; white-space:normal;">' +
            'Automatischer Tages-Snapshot <br>' +
            'zur eingestellten Uhrzeit<br>' +
            'aktivieren/deaktivieren.' +
            '</div>'
        );

        try {

            const autoCheckBoxLabel =
                  snapshotAutoCheckBox.getChildControl(
                      'label'
                  );

            autoCheckBoxLabel.set({
                textColor: '#ffff00'
            });

        } catch (e) {

            log.warning(
                'Automatik-Beschriftung konnte nicht eingefärbt werden:',
                e
            );
        }


        snapshotAutoCheckBox.setValue(
            snapshotSettings.enabled
        );


        const snapshotAutoStatusLabel =
              new qx.ui.basic.Label(
                  ''
              );


        function updateSnapshotAutoStatusLabel() {

            const active =
                  snapshotAutoCheckBox.getValue();

            snapshotAutoStatusLabel.setValue(
                active
                ? 'Automatik aktiv'
                : 'Automatik inaktiv'
            );

            snapshotAutoStatusLabel.set({
                textColor:
                active
                ? '#00cc66'
                : '#ff4444',
                font: 'bold'
            });
        }


        updateSnapshotAutoStatusLabel();

        snapshotAutoStatusLabel.set({
            textColor:
            snapshotAutoCheckBox.getValue()
            ? '#00cc66'
            : '#ffffff'
        });


        const snapshotTimeLabel =
              new qx.ui.basic.Label(
                  'Uhrzeit:'
              );

        snapshotTimeLabel.set({
            textColor: '#ffff00'
        });


        const snapshotTimeField =
              new qx.ui.form.TextField(
                  snapshotSettings.time
              );


        snapshotTimeField.set({
            width: 55,
            height: 26
        });

        snapshotTimeField.setToolTipText(
            '<div style="width:230px; white-space:normal;">' +
            'Uhrzeit festlegen, zu der der automatische <br>' +
            'Tages-Snapshot ausgelöst wird.' +
            '</div>'
        );

        const snapshotSaveButton =
              new qx.ui.form.Button(
                  'Speichern'
              );


        snapshotSaveButton.set({
            width: 75,
            height: 26
        });

        snapshotSaveButton.setToolTipText(
            '<div style="width:210px; white-space:normal;">' +
            'Auslösen eines automatischen Snapshot zur eingestellten Uhrzeit.<br>' +
            '<span style="color:red; font-weight:bold;">Achtung!</span> ' +
            'Du musst zur eingestellten Auslösezeit im Spiel sein!' +
            '</div>'
        );

        const snapshotNowButton =
              new qx.ui.form.Button(
                  'Snapshot jetzt'
              );


        snapshotNowButton.set({
            width: 95,
            height: 26
        });

        snapshotNowButton.setToolTipText(
            '<div style="width:300px; white-space:normal;">' +
            'Es wird ein sofortiger Snapshot ausgeführt,<br>' +
            'welcher bis zur erneuten Auslösung gespeichert wird.' +
            '</div>'
        );

        snapshotStatusLabel =
            new qx.ui.basic.Label(
            ''
        );

        snapshotStatusLabel.set({
            textColor: '#ffff00'
        });


        snapshotAutoCheckBox.addListener(
            'changeValue',
            function () {

                const time =
                      String(
                          snapshotTimeField.getValue() || ''
                      )
                .trim();

                if (!isValidSnapshotTime(time)) {
                    updateSnapshotAutoStatusLabel();
                    return;
                }

                saveSnapshotSettings(
                    snapshotAutoCheckBox.getValue(),
                    time
                );

                scheduleNextSnapshot();
                updateSnapshotAutoStatusLabel();

                log.info(
                    snapshotAutoCheckBox.getValue()
                    ? 'Tages-Snapshot-Automatik aktiviert.'
                    : 'Tages-Snapshot-Automatik deaktiviert.'
                );
            }
        );


        snapshotSaveButton.addListener(
            'execute',
            function () {

                const time =
                      String(
                          snapshotTimeField.getValue() || ''
                      )
                .trim();


                if (!isValidSnapshotTime(time)) {

                    log.warning(
                        'Ungültige Snapshot-Uhrzeit. Bitte HH:MM eingeben. 24:00 ist ebenfalls erlaubt.'
                    );

                    return;
                }


                saveSnapshotSettings(
                    snapshotAutoCheckBox.getValue(),
                    time
                );


                scheduleNextSnapshot();


                updateSnapshotStatusLabel();
                updateSnapshotAutoStatusLabel();


                log.success(
                    `Snapshot-Einstellungen gespeichert: ${snapshotAutoCheckBox.getValue() ? 'aktiv' : 'inaktiv'}, ${time} Uhr.`
                );

            }
        );


        snapshotContainer.add(
            snapshotAutoCheckBox
        );


        snapshotContainer.add(
            snapshotAutoStatusLabel
        );


        snapshotContainer.add(
            snapshotTimeLabel
        );


        snapshotContainer.add(
            snapshotTimeField
        );


        snapshotContainer.add(
            snapshotSaveButton
        );


        snapshotContainer.add(
            snapshotNowButton
        );


        snapshotContainer.add(
            snapshotStatusLabel,
            {
                flex: 1
            }
        );


        snapshotNowButton.addListener(
            'execute',
            function () {

                requestManualSnapshot();

                // Die Serverantworten sind asynchron. Mehrere
                // kurze Aktualisierungen sorgen dafür, dass die
                // Anzeige nach dem Speichern sofort nachzieht.
                setTimeout(
                    function () {
                        if (
                            typeof dailyRankingRefreshCallback ===
                            'function'
                        ) {
                            dailyRankingRefreshCallback();
                        }
                    },
                    800
                );

                setTimeout(
                    function () {
                        if (
                            typeof dailyRankingRefreshCallback ===
                            'function'
                        ) {
                            dailyRankingRefreshCallback();
                        }
                    },
                    1800
                );
            }
        );


        // -----------------------------------------------------
        // Snapshot-Einstellungen beim Start anzeigen,
        // da das Daily-Ranking der Start-Reiter ist.
        // -----------------------------------------------------

        snapshotContainer.setVisibility(
            'visible'
        );

        mainContainer.add(
            snapshotContainer
        );


        // =====================================================
        // DAILY-RANKING INHALT
        // =====================================================

        const dailyContent =
              new qx.ui.container.Composite(
                  new qx.ui.layout.VBox(6)
              );

        dailyContent.set({
            paddingTop: 4,
            paddingBottom: 4
        });


        const dailyHeader =
              new qx.ui.container.Composite(
                  new qx.ui.layout.HBox(8)
              );


        const dailyInfoLabel =
              new qx.ui.basic.Label(
                  'Daily-Ranking: Top 100 Spieler und Top 25 Allianzen'
              );

        dailyInfoLabel.set({
            font: 'bold',
            textColor: '#ffff00'
        });


        dailyHeader.add(
            dailyInfoLabel
        );


        const dailySearchSpacer =
              new qx.ui.core.Spacer();

        dailyHeader.add(
            dailySearchSpacer,
            {
                flex: 1
            }
        );


        // -----------------------------------------------------
        // Spielersuche im Daily-Ranking
        // -----------------------------------------------------

        const dailySearchLabel =
              new qx.ui.basic.Label(
                  'Spieler:'
              );


        const dailySearchField =
              new qx.ui.form.TextField();

        dailySearchField.set({
            width: 180,
            height: 26
        });

        // -----------------------------------------------------
        // Suchfeld löschen
        // -----------------------------------------------------

        const dailySearchClearButton =
              new qx.ui.form.Button(
                  '×'
              );

        dailySearchClearButton.set({
            width: 22,
            height: 26,
            textColor: '#ff4444',
            font: 'bold'
        });

        dailySearchClearButton.setVisibility(
            'excluded'
        );
        const dailySearchButton =
              new qx.ui.form.Button(
                  'Suchen'
              );

        dailySearchButton.set({
            width: 75,
            height: 26
        });


        dailyHeader.add(
            dailySearchLabel
        );

        dailyHeader.add(
            dailySearchField
        );

        dailyHeader.add(
            dailySearchClearButton
        );

        dailySearchClearButton.addListener(
            'execute',
            function () {

                dailySearchField.setValue('');

                dailySearchClearButton.setVisibility(
                    'excluded'
                );

                dailySearchField.focus();

            }
        );


        dailySearchField.addListener(
            'input',
            function () {

                const value =
                      String(
                          dailySearchField.getValue() || ''
                      );

                dailySearchClearButton.setVisibility(
                    value.length > 0
                    ? 'visible'
                    : 'excluded'
                );

            }
        );

        dailyHeader.add(
            dailySearchButton
        );


        dailyContent.add(
            dailyHeader
        );


        // -----------------------------------------------------
        // Spieler Daily-Ranking
        // -----------------------------------------------------

        const dailyPlayerLabel =
              new qx.ui.basic.Label(
                  'Spieler – Top 100'
              );

        dailyPlayerLabel.set({
            textColor: '#ffff00'
        });

        dailyContent.add(
            dailyPlayerLabel
        );


        dailyPlayerModel =
            new qx.ui.table.model.Simple();

        dailyPlayerModel.setColumns([
            'Rang',
            'Spieler',
            'Allianz',
            'Snapshot',
            'Punkte aktuell',
            'Änderung'
        ]);


        const dailyPlayerTable =
              new qx.ui.table.Table(
                  dailyPlayerModel
              );

        dailyPlayerTable.set({
            width: 730,
            height: 210,
            decorator: 'main',
            showCellFocusIndicator: false
        });


        dailyContent.add(
            dailyPlayerTable
        );

        // =====================================================
        // SPIELERSUCHE DAILY-RANKING
        // =====================================================

        dailySearchButton.addListener(
            'execute',
            function () {

                const searchText =
                      String(
                          dailySearchField.getValue() || ''
                      )
                .trim()
                .toLowerCase();



                // -------------------------------------------------
                // Leere Suche
                // -------------------------------------------------

                if (!searchText) {

                    log.warning(
                        'Bitte einen Spielernamen eingeben.'
                    );

                    return;
                }


                // -------------------------------------------------
                // Spieler im Daily-Ranking suchen
                // -------------------------------------------------

                let foundIndex = -1;

                const rowCount =
                      dailyPlayerModel.getRowCount();


                // Exakter Treffer

                for (
                    let i = 0;
                    i < rowCount;
                    i++
                ) {

                    const playerName =
                          String(
                              dailyPlayerModel.getValue(
                                  1,
                                  i
                              ) || ''
                          )
                    .trim()
                    .toLowerCase();


                    if (
                        playerName === searchText
                    ) {

                        foundIndex = i;

                        break;
                    }
                }


                // -------------------------------------------------
                // Teiltreffer
                // -------------------------------------------------

                if (foundIndex === -1) {

                    for (
                        let i = 0;
                        i < rowCount;
                        i++
                    ) {

                        const playerName =
                              String(
                                  dailyPlayerModel.getValue(
                                      1,
                                      i
                                  ) || ''
                              )
                        .trim()
                        .toLowerCase();


                        if (
                            playerName.includes(
                                searchText
                            )
                        ) {

                            foundIndex = i;

                            break;
                        }
                    }
                }


                // -------------------------------------------------
                // Kein Treffer
                // -------------------------------------------------

                if (foundIndex === -1) {

                    log.warning(
                        `Spieler "${dailySearchField.getValue()}" wurde im Daily-Ranking nicht gefunden.`
            );

                    return;
                }


                // -------------------------------------------------
                // Treffer auswählen
                // -------------------------------------------------

                const selectionModel =
                      dailyPlayerTable
                .getSelectionModel();

                selectionModel.setSelectionInterval(
                    foundIndex,
                    foundIndex
                );


                // -------------------------------------------------
                // Zum Treffer scrollen
                // -------------------------------------------------

                const paneScroller =
                      dailyPlayerTable.getPaneScroller(
                          0
                      );

                paneScroller.setScrollY(
                    Math.max(
                        0,
                        (foundIndex - 3) * 20
                    )
                );


                // -------------------------------------------------
                // Erfolgreiche Suche
                // -------------------------------------------------

                log.success(
                    `Spieler "${dailyPlayerModel.getValue(1, foundIndex)}" im Daily-Ranking gefunden.`
        );

            }
        );
        // -----------------------------------------------------
        // Allianz Daily-Ranking
        // -----------------------------------------------------

        const dailyAllianceLabel =
              new qx.ui.basic.Label(
                  'Allianzen – Top 25'
              );

        dailyAllianceLabel.set({
            textColor: '#ffff00',
            font: 'bold'
        });

        dailyContent.add(
            dailyAllianceLabel
        );


        dailyAllianceModel =
            new qx.ui.table.model.Simple();

        dailyAllianceModel.setColumns([
            'Rang',
            'Allianz',
            'Snapshot',
            'Punkte aktuell',
            'Änderung'
        ]);


        const dailyAllianceTable =
              new qx.ui.table.Table(
                  dailyAllianceModel
              );

        dailyAllianceTable.set({
            width: 730,
            height: 210,
            decorator: 'main',
            showCellFocusIndicator: false
        });


        dailyContent.add(
            dailyAllianceTable
        );


        // -----------------------------------------------------
        // Lesbare Daily-Tabellenköpfe
        // -----------------------------------------------------
        // Die Header-Zellen bekommen bewusst eine helle
        // Schriftfarbe. Der Hintergrund des Spiels kann sich
        // hinter dem Fenster verändern, deshalb verlassen wir
        // uns nicht auf die Standard-Themefarbe.

        function styleDailyTableHeaders(
        table,
         columnCount
        ) {

            const columnModel =
                  table.getTableColumnModel();


            for (
                let i = 0;
                i < columnCount;
                i++
            ) {

                const headerRenderer =
                      new qx.ui.table.headerrenderer.Default();


                columnModel.setHeaderCellRenderer(
                    i,
                    headerRenderer
                );


                try {

                    const headerLabel =
                          headerRenderer.getChildControl(
                              'label'
                          );


                    headerLabel.set({
                        textColor: '#ffff00',
                        font: 'bold'
                    });

                } catch (e) {

                    log.warning(
                        'Daily-Header konnte nicht eingefärbt werden:',
                        e
                    );
                }
            }
        }


        styleDailyTableHeaders(
            dailyPlayerTable,
            6
        );


        styleDailyTableHeaders(
            dailyAllianceTable,
            5
        );


        // Snapshot-Spalte etwas breiter, damit z.B.
        // "Snapshot (12:14)" vollständig lesbar bleibt.
        dailyPlayerTable
            .getTableColumnModel()
            .setColumnWidth(
            3,
            125
        );


        dailyAllianceTable
            .getTableColumnModel()
            .setColumnWidth(
            2,
            125
        );


        // -----------------------------------------------------
        // Farbige Daily-Änderungsspalten
        // -----------------------------------------------------
        // HTML-Renderer, damit ▲/▼ und der Wert zuverlässig
        // innerhalb derselben Zelle farbig dargestellt werden.

        const dailyChangeRenderer =
              new qx.ui.table.cellrenderer.Html();


        dailyPlayerTable
            .getTableColumnModel()
            .setDataCellRenderer(
            5,
            dailyChangeRenderer
        );


        dailyAllianceTable
            .getTableColumnModel()
            .setDataCellRenderer(
            4,
            dailyChangeRenderer
        );


        // -----------------------------------------------------
        // Daily-Daten anzeigen
        // -----------------------------------------------------

        function renderDailyRanking() {

            const playerSnapshot =
                  loadLatestRankingSnapshot();

            const allianceSnapshot =
                  loadLatestAllianceRankingSnapshot();


            const snapshotTime =
                  playerSnapshot &&
                  playerSnapshot.time
            ? playerSnapshot.time
            : (
                allianceSnapshot &&
                allianceSnapshot.time
                ? allianceSnapshot.time
                : ''
            );


            const snapshotHeader =
                  snapshotTime
            ? `Snapshot (${snapshotTime})`
                      : 'Snapshot';


            if (dailyPlayerModel) {

                dailyPlayerModel.setColumns([
                    'Rang',
                    'Spieler',
                    'Allianz',
                    snapshotHeader,
                    'Punkte aktuell',
                    'Änderung'
                ]);
            }


            if (dailyAllianceModel) {

                dailyAllianceModel.setColumns([
                    'Rang',
                    'Allianz',
                    snapshotHeader,
                    'Punkte aktuell',
                    'Änderung'
                ]);
            }


            // =================================================
            // Spieler
            // =================================================

            if (
                !playerSnapshot ||
                !playerSnapshot.players ||
                Object.keys(
                    playerSnapshot.players
                ).length === 0
            ) {

                dailyPlayerModel.setData([
                    [
                        '',
                        'Noch kein Daily-Snapshot vorhanden.',
                        '',
                        '',
                        '',
                        ''
                    ]
                ]);

            } else {

                const currentPlayerMap = {};

                dailyCurrentPlayers.forEach(
                    function (player) {

                        if (!player || !player.pn) {
                            return;
                        }

                        currentPlayerMap[player.pn] =
                            player;
                    }
                );


                const playerNames =
                      Object.keys(
                          playerSnapshot.players
                      );


                playerNames.sort(
                    function (a, b) {

                        const aData =
                              playerSnapshot.players[a];

                        const bData =
                              playerSnapshot.players[b];

                        const aRank =
                              aData &&
                              typeof aData === 'object'
                        ? Number(aData.rank || 9999)
                        : (
                            currentPlayerMap[a]
                            ? Number(
                                currentPlayerMap[a].r || 9999
                            )
                            : 9999
                        );

                        const bRank =
                              bData &&
                              typeof bData === 'object'
                        ? Number(bData.rank || 9999)
                        : (
                            currentPlayerMap[b]
                            ? Number(
                                currentPlayerMap[b].r || 9999
                            )
                            : 9999
                        );

                        return aRank - bRank;
                    }
                );


                const playerRows =
                      playerNames
                .slice(0, 100)
                .map(
                    function (playerName) {

                        const saved =
                              playerSnapshot.players[
                                  playerName
                              ];

                        const savedIsObject =
                              saved &&
                              typeof saved === 'object';

                        const snapshotPoints =
                              savedIsObject
                        ? Number(
                            saved.points || 0
                        )
                        : Number(saved || 0);

                        const current =
                              currentPlayerMap[
                                  playerName
                              ];

                        const currentPoints =
                              current
                        ? Number(
                            current.s || 0
                        )
                        : null;

                        let changeText =
                            '<span style="color:#888888;font-weight:bold;">—</span>';

                        if (
                            currentPoints !== null
                        ) {

                            const difference =
                                  currentPoints -
                                  snapshotPoints;

                            if (difference > 0) {

                                changeText =
                                    '<span style="color:#00cc66;font-weight:bold;">▲ ' +
                                    difference.toLocaleString(
                                    'de-DE'
                                ) +
                                    '</span>';

                            } else if (
                                difference < 0
                            ) {

                                changeText =
                                    '<span style="color:#ff4444;font-weight:bold;">▼ ' +
                                    Math.abs(
                                    difference
                                ).toLocaleString(
                                    'de-DE'
                                ) +
                                    '</span>';
                            }
                        }


                        return [

                            savedIsObject
                            ? Number(saved.rank || '')
                            : (
                                current
                                ? current.r
                                : ''
                            ),

                            playerName,

                            savedIsObject
                            ? (
                                saved.alliance ||
                                (current
                                 ? current.an
                                 : '-')
                            )
                            : (
                                current
                                ? current.an
                                : '-'
                            ),

                            snapshotPoints.toLocaleString(
                                'de-DE'
                            ),

                            currentPoints === null
                            ? '—'
                            : currentPoints.toLocaleString(
                                'de-DE'
                            ),

                            changeText
                        ];
                    }
                );


                dailyPlayerModel.setData(
                    playerRows
                );
            }


            // =================================================
            // Allianzen
            // =================================================

            if (
                !allianceSnapshot ||
                !allianceSnapshot.alliances ||
                Object.keys(
                    allianceSnapshot.alliances
                ).length === 0
            ) {

                dailyAllianceModel.setData([
                    [
                        '',
                        'Noch kein Daily-Snapshot vorhanden.',
                        '',
                        '',
                        ''
                    ]
                ]);

            } else {

                const currentAllianceMap = {};

                dailyCurrentAlliances.forEach(
                    function (alliance) {

                        if (!alliance || !alliance.an) {
                            return;
                        }

                        currentAllianceMap[
                            alliance.an
                        ] = alliance;
                    }
                );


                const allianceNames =
                      Object.keys(
                          allianceSnapshot.alliances
                      );


                allianceNames.sort(
                    function (a, b) {

                        const aData =
                              allianceSnapshot.alliances[a];

                        const bData =
                              allianceSnapshot.alliances[b];

                        const aRank =
                              aData &&
                              typeof aData === 'object'
                        ? Number(aData.rank || 9999)
                        : (
                            currentAllianceMap[a]
                            ? Number(
                                currentAllianceMap[a].r || 9999
                            )
                            : 9999
                        );

                        const bRank =
                              bData &&
                              typeof bData === 'object'
                        ? Number(bData.rank || 9999)
                        : (
                            currentAllianceMap[b]
                            ? Number(
                                currentAllianceMap[b].r || 9999
                            )
                            : 9999
                        );

                        return aRank - bRank;
                    }
                );


                const allianceRows =
                      allianceNames
                .slice(0, 25)
                .map(
                    function (allianceName) {

                        const saved =
                              allianceSnapshot.alliances[
                                  allianceName
                              ];

                        const savedIsObject =
                              saved &&
                              typeof saved === 'object';

                        const snapshotPoints =
                              savedIsObject
                        ? Number(
                            saved.top40 || 0
                        )
                        : Number(saved || 0);

                        const current =
                              currentAllianceMap[
                                  allianceName
                              ];

                        const currentPoints =
                              current
                        ? Number(
                            current.s || 0
                        )
                        : null;

                        let changeText =
                            '<span style="color:#888888;font-weight:bold;">—</span>';

                        if (
                            currentPoints !== null
                        ) {

                            const difference =
                                  currentPoints -
                                  snapshotPoints;

                            if (difference > 0) {

                                changeText =
                                    '<span style="color:#00cc66;font-weight:bold;">▲ ' +
                                    difference.toLocaleString(
                                    'de-DE'
                                ) +
                                    '</span>';

                            } else if (
                                difference < 0
                            ) {

                                changeText =
                                    '<span style="color:#ff4444;font-weight:bold;">▼ ' +
                                    Math.abs(
                                    difference
                                ).toLocaleString(
                                    'de-DE'
                                ) +
                                    '</span>';
                            }
                        }


                        return [

                            savedIsObject
                            ? Number(saved.rank || '')
                            : (
                                current
                                ? current.r
                                : ''
                            ),

                            allianceName,

                            snapshotPoints.toLocaleString(
                                'de-DE'
                            ),

                            currentPoints === null
                            ? '—'
                            : currentPoints.toLocaleString(
                                'de-DE'
                            ),

                            changeText
                        ];
                    }
                );


                dailyAllianceModel.setData(
                    allianceRows
                );
            }
        }


        dailyRankingRefreshCallback =
            renderDailyRanking;


        mainContainer.add(
            dailyContent,
            {
                flex: 1
            }
        );




        // =====================================================
        // RANKING-INHALT
        // =====================================================

        const rankingContent =
              new qx.ui.container.Composite(
                  new qx.ui.layout.VBox(0)
              );

        mainContainer.add(
            rankingContent,
            {
                flex: 1
            }
        );

        rankingContent.setVisibility(
            'excluded'
        );

        // =====================================================
        // STARTANSICHT
        // =====================================================

        if (startView === 'daily') {

            rangeContainer.setVisibility(
                'excluded'
            );

            snapshotContainer.setVisibility(
                'visible'
            );

            rankingContent.setVisibility(
                'excluded'
            );

            dailyContent.setVisibility(
                'visible'
            );

            updateSnapshotStatusLabel();

            requestDailyPlayerRanking(
                function (players) {

                    dailyCurrentPlayers =
                        players || [];

                    renderDailyRanking();
                }
            );

            requestDailyAllianceRanking(
                function (alliances) {

                    dailyCurrentAlliances =
                        alliances || [];

                    renderDailyRanking();
                }
            );

            renderDailyRanking();

        } else {

            rangeContainer.setVisibility(
                'visible'
            );

            snapshotContainer.setVisibility(
                'excluded'
            );

            dailyContent.setVisibility(
                'excluded'
            );

            rankingContent.setVisibility(
                'visible'
            );

        }

        // =====================================================
        // TABELLENMODELL
        // =====================================================

        const tableModel =
              new qx.ui.table.model.Simple();


        // -----------------------------------------------------
        // Normale Spieler-Ranking-Spalten
        // -----------------------------------------------------
        // Snapshot-Spalten gehören ausschließlich ins Daily-Ranking.
        tableModel.setColumns([
            'Rang',
            'Spieler',
            'Allianz',
            'Punkte',
            '',
            'Änderung'
        ]);


        // -----------------------------------------------------
        // Daten vorbereiten
        // -----------------------------------------------------

        const tableData =
              players.map(function (player) {

                  const change =
                        calculatePointChange(
                            player,
                            previousPoints
                        );

                  let changeText = '—';

                  let changeArrow = '—';
                  let changeValue = '';

                  if (change.type === 'up') {

                      changeArrow = '▲';

                      changeValue =
                          change.value.toLocaleString('de-DE');

                  }

                  if (change.type === 'down') {

                      changeArrow = '▼';

                      changeValue =
                          change.value.toLocaleString('de-DE');

                  }


                  return [

                      player.r,

                      player.pn || '-',

                      player.an || '-',

                      Number(player.s || 0)
                      .toLocaleString('de-DE'),

                      changeArrow,

                      changeValue
                  ];
              });


        tableModel.setData(
            tableData
        );


        // =====================================================
        // TABELLE
        // =====================================================

        const rankingTable =
              new qx.ui.table.Table(
                  tableModel
              );

        // =====================================================
        // SPIELERSUCHE
        // =====================================================

        searchButton.addListener(
            'execute',
            function () {

                const searchText =
                      String(
                          searchField.getValue() || ''
                      )
                .trim()
                .toLowerCase();


                // -------------------------------------------------
                // Leere Suche
                // -------------------------------------------------

                if (!searchText) {

                    log.warning(
                        'Bitte einen Spielernamen eingeben.'
                    );

                    return;
                }


                // -------------------------------------------------
                // Spieler suchen
                // -------------------------------------------------

                let foundIndex = -1;


                // Exakter Treffer
                for (
                    let i = 0;
                    i < players.length;
                    i++
                ) {

                    const playerName =
                          String(
                              players[i].pn || ''
                          )
                    .trim()
                    .toLowerCase();


                    if (
                        playerName === searchText
                    ) {

                        foundIndex = i;

                        break;
                    }
                }


                // -------------------------------------------------
                // Teiltreffer
                // -------------------------------------------------

                if (foundIndex === -1) {

                    for (
                        let i = 0;
                        i < players.length;
                        i++
                    ) {

                        const playerName =
                              String(
                                  players[i].pn || ''
                              )
                        .trim()
                        .toLowerCase();


                        if (
                            playerName.includes(
                                searchText
                            )
                        ) {

                            foundIndex = i;

                            break;
                        }
                    }
                }


                // -------------------------------------------------
                // Kein Treffer
                // -------------------------------------------------

                if (foundIndex === -1) {

                    log.warning(
                        `Spieler "${searchField.getValue()}" wurde im aktuellen Rangbereich nicht gefunden.`
            );

                    return;
                }

                // -------------------------------------------------
                // Treffer auswählen
                // -------------------------------------------------

                const selectionModel =
                      rankingTable.getSelectionModel();

                selectionModel.setSelectionInterval(
                    foundIndex,
                    foundIndex
                );


                // -------------------------------------------------
                // Zum Treffer scrollen
                // -------------------------------------------------

                const paneScroller =
                      rankingTable.getPaneScroller(
                          0
                      );

                paneScroller.setScrollY(
                    foundIndex * 25
                );


                // -------------------------------------------------
                // Erfolgreiche Suche
                // -------------------------------------------------

                log.success(
                    `Spieler "${players[foundIndex].pn}" gefunden – Rang ${players[foundIndex].r}.`
        );

            }
        );
        rankingTable.set({

            width: 730,

            height: 560,

            decorator: 'main',

            showCellFocusIndicator: false
        });


        // -----------------------------------------------------
        // Spaltenbreiten
        // -----------------------------------------------------

        const columnModel =
              rankingTable.getTableColumnModel();


        // Rang
        columnModel.setColumnWidth(
            0,
            50
        );


        // Spieler
        columnModel.setColumnWidth(
            1,
            130
        );


        // Allianz
        columnModel.setColumnWidth(
            2,
            130
        );


        // Punkte
        columnModel.setColumnWidth(
            3,
            90
        );


        // Pfeil
        columnModel.setColumnWidth(
            4,
            35
        );


        // Änderung
        columnModel.setColumnWidth(
            5,
            95
        );

        // =========================================================
        // FARBIGE VERGLEICHSSPALTE
        // =========================================================

        const arrowRenderer =
              new qx.ui.table.cellrenderer.Default();

        arrowRenderer._getCellStyle =
            function (cellInfo) {

            const value =
                  String(cellInfo.value || '');

            if (value === '▲') {

                return [
                    'color:#00cc66',
                    'font-weight:bold',
                    'text-align:center'
                ].join(';') + ';';
            }

            if (value === '▼') {

                return [
                    'color:#ff4444',
                    'font-weight:bold',
                    'text-align:center'
                ].join(';') + ';';
            }

            return [
                'color:#888888',
                'font-weight:bold',
                'text-align:center'
            ].join(';') + ';';
        };

        columnModel.setDataCellRenderer(
            4,
            arrowRenderer
        );

        // -----------------------------------------------------
        // Statuszeile der Tabelle
        // -----------------------------------------------------

        rankingTable.setAdditionalStatusBarText(
            `${players.length} Spieler angezeigt`
        );


        // =====================================================
        // TABELLE EINBAUEN
        // =====================================================

        rankingContent.add(
            rankingTable,
            {
                flex: 1
            }
        );


        rankingWindow.add(
            mainContainer
        );


        // =====================================================
        // FENSTER SCHLIESSEN
        // =====================================================

        rankingWindow.addListener(
            'close',
            function () {

                rankingWindow =
                    null;

                dailyRankingRefreshCallback =
                    null;

                log.info(
                    'Ranking-Fenster geschlossen.'
                );
            }
        );


        // =====================================================
        // FENSTER ÖFFNEN
        // =====================================================

        qxApp
            .getRoot()
            .add(
            rankingWindow
        );


        rankingWindow.open();

        rankingWindow.center();

        saveCurrentPoints(players);

        log.success(
            `${players.length} Spieler werden angezeigt.`
        );
    }


    // =========================================================
    // Player RANKING ABRUFEN
    // =========================================================

    function requestPlayerRanking(startView) {

        log.section(
            'SPIELER-RANKING ABRUF'
        );


        try {

            const view =
                  ClientLib.Data.Ranking.EViewType.Player;


            const rankingType =
                  0;


            const sortColumn =
                  ClientLib.Data.Ranking.ESortColumn.Rank;


            const ascending =
                  true;

            const rankingRange =
                  loadPlayerRankingRange();

            const firstIndex =
                  rankingRange.from - 1;

            const lastIndex =
                  rankingRange.to - 1;

            log.info(
                `Fordere Rang ${rankingRange.from} bis ${rankingRange.to} an...`
            );

            log.info(
                'Fordere Rang 1 bis 50 an...'
            );


            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendSimpleCommand(

                'RankingGetData',

                {

                    firstIndex: firstIndex,
                    lastIndex: lastIndex,

                    view: view,

                    rankingType: rankingType,

                    sortColumn: sortColumn,

                    ascending: ascending
                },


                phe.cnc.Util.createEventDelegate(

                    ClientLib.Net.CommandResult,

                    this,


                    function (
                    context,
                     data
                    ) {

                        log.section(
                            'SERVER-ANTWORT'
                        );


                        if (
                            !data ||
                            !Array.isArray(data.p)
                        ) {

                            log.error(
                                'Keine gültigen Spielerdaten erhalten.',
                                data
                            );

                            return;
                        }


                        log.success(
                            `${data.p.length} Spieler erhalten.`
                            );


                        showRanking(
                            data.p,
                            startView
                        );
                    }
                ),


                null
            );


            log.success(
                'RankingGetData wurde gesendet.'
            );


        } catch (e) {

            log.error(
                'Fehler beim Ranking-Abruf:',
                e
            );

            console.error(e);
        }
    }

    // =========================================================
    // ALLIANZ-RANKING ABRUFEN – TEST
    // =========================================================

    function requestAllianceRanking(onSuccess) {

        log.section(
            'ALLIANZ-RANKING ABRUF'
        );

        try {

            const view =
                  ClientLib.Data.Ranking.EViewType.Alliance;

            const rankingType =
                  0;

            const sortColumn =
                  ClientLib.Data.Ranking.ESortColumn.Rank;

            const ascending =
                  true;


            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendSimpleCommand(

                'RankingGetData',

                {
                    firstIndex: 0,
                    lastIndex: 24,
                    view: view,
                    rankingType: rankingType,
                    sortColumn: sortColumn,
                    ascending: ascending
                },


                phe.cnc.Util.createEventDelegate(

                    ClientLib.Net.CommandResult,

                    this,


                    function (
                    context,
                     data
                    ) {

                        if (Array.isArray(data.a)) {

                            data.a.forEach(
                                function (alliance, index) {

                                    log.info(
                                        `Allianz ${index + 1}: Rang=${alliance.r}, Name=${alliance.an}, Top40=${alliance.s}, Spieler=${alliance.pc}, Basen=${alliance.bc}, sa=${alliance.sa}, sc=${alliance.sc}`
                                    );

                                }
                            );


                            if (typeof onSuccess === 'function') {

                                onSuccess(data.a);

                            }

                        }


                        if (
                            !data
                        ) {

                            log.error(
                                'Keine Allianz-Daten erhalten.',
                                data
                            );

                            return;
                        }


                        log.success(
                            'Allianz-Ranking erfolgreich empfangen!'
                        );

                    }
                ),


                null
            );


        } catch (e) {

            log.error(
                'Fehler beim Allianz-Ranking-Abruf:',
                e
            );

            console.error(e);
        }
    }
    // =========================================================
    // SCRIPTE-MENÜ
    // =========================================================

    const rankingToolIcon =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADKElEQVR42gXBS2tcZQCA4ff75pyZMzNnck4yaZqGmZgL0TYRarEGhIrULrygLtqVK8GNv8BfIG5EoQt3grhxUURQFCwWrGlEqq2toERikyZN086lM8nMZC7n8l18HgHY1bNnePGFMyiV4gcFRiQYJ0G4llSlCJNBD8H38rSbB0gy/Luxw81bdxFLi/N29fnTfH/1GqnRBKGPlZZKdZyZyiRgqT1qsbvbxhpLr9NHx5bXL7zEf1sPkPOzFX5au0FkU3AsB4MWjVabt18u8e3nb/H15fNcOlegFfVJnZRgLmT69Djrt/9ktjKNk3EkuXwOOeqzsvws1dkTdOMY3X/E3z+v4zmWdqONSDUnnivzxZVX+fTjdX78pMbEZICTpopSsch+rcYr585z6eJFkiRm7ZsP2Ln3AEGWJ90YfJc33lniu7Xb/HZth3J5isEwwun0ByijEI5g7+Eea2vXGSYR+3sHqGaXNNb0I8n7l1eZMYofPupQ30iYm4L2YQcJBmMNVlq6vR7NVpPNf7aIJyVT71WJ5j1OvjuJ2X3C05s+by6GCAUWi8wIpNYag0Y4gnbrgN9v3CG3tE3pguLKl9sMzjrc/KVO+6sO9/fr3NlughAYrVFK4yiVotFYaWn0HvHMa5Z6ucPGh0Oe8uHXz46I90GGguu3tqh3E6y0GAxaKxxtDKlSeI5HMF1g1JBsX4VyaZrsoseUNnSk4t7jLsfGysReTMGtk6oUbQzi1KkFexh3qVbm8GSeo6MhhphivoSbyeJmHQbRAJmBJE3xSz6do0PqjcdM+WUcL+tgR5ZyOIFE4Ad5/LxP97BHGIyRqBG9XofqbJXRMKI0VuJYOEGjXqOYzyFWluftTqtGnIkIAw+ZEYRBgbDsIoRAaUWhmGfjjyYia5E4RKkh7WtOVuYQC/MzNnUMD+t1KIDrg8hAzoXjVQ8pBIeHETqFo44l7QMDmD4+Sej6CMfJ2JXlBRJp6I+GOFmJW5AksSEMXKQjaDdiMh6YCJJYMVb0CfNF/rq7iQCsFILFhQrjQcBwFBEnCiFAa4MFXFditCWXdcjlXAajiO37+6Sp4n+au4wgLQZ84QAAAABJRU5ErkJggg==';


    function addScriptsMenuEntry() {

        try {

            log.section(
                'SCRIPTE-MENÜ'
            );


            const scriptsButton =
                  qxApp
            .getMenuBar()
            .getScriptsButton();


            log.info(
                'Scripte-Button gefunden.'
            );


            // -------------------------------------------------
            // Menüeintrag hinzufügen
            // -------------------------------------------------

            scriptsButton.Add(
                scriptName,
                rankingToolIcon
            );


            log.success(
                'Menüeintrag wurde hinzugefügt.'
            );


            // -------------------------------------------------
            // Menü holen
            // -------------------------------------------------

            const menu =
                  scriptsButton.getMenu();


            if (!menu) {

                log.error(
                    'Scripte-Menü konnte nicht gefunden werden.'
                );

                return;
            }


            // -------------------------------------------------
            // Menüeinträge suchen
            // -------------------------------------------------

            const children =
                  menu.getChildren();


            log.info(
                `Menü enthält ${children.length} Einträge.`
            );


            const menuItem =
                  children.find(
                      item =>
                      item.getLabel &&
                      item.getLabel() === scriptName
                  );


            if (!menuItem) {

                log.error(
                    `Menüeintrag "${scriptName}" konnte nach dem Hinzufügen nicht gefunden werden.`
                );

                return;
            }


            log.success(
                'Menüeintrag gefunden.',
                menuItem
            );


            // -------------------------------------------------
            // Klick / Ausführung
            // -------------------------------------------------

            menuItem.addListener(

                'execute',

                function () {

                    log.section(
                        'RANKINGTOOL AUFGERUFEN'
                    );


                    log.success(
                        'Klick auf RankingTool erkannt.'
                    );


                    requestPlayerRanking('daily');
                },

                this
            );


            log.success(
                'Execute-Listener erfolgreich registriert.'
            );


        } catch (e) {

            log.error(
                'Fehler beim Scripte-Menü:',
                e
            );

            console.error(e);
        }
    }


    // =========================================================
    // AUF SPIEL WARTEN
    // =========================================================

    function waitForGame() {

        try {

            if (
                typeof qx === 'undefined' ||
                typeof ClientLib === 'undefined'
            ) {

                setTimeout(
                    waitForGame,
                    1000
                );

                return;
            }


            if (
                !qx.core ||
                !qx.core.Init ||
                !qx.core.Init.getApplication
            ) {

                setTimeout(
                    waitForGame,
                    1000
                );

                return;
            }


            qxApp =
                qx.core.Init.getApplication();


            if (!qxApp) {

                setTimeout(
                    waitForGame,
                    1000
                );

                return;
            }


            if (
                !qxApp.getMenuBar ||
                !qxApp.getMenuBar()
            ) {

                setTimeout(
                    waitForGame,
                    1000
                );

                return;
            }


            if (
                !qxApp
                .getMenuBar()
                .getScriptsButton()
            ) {

                setTimeout(
                    waitForGame,
                    1000
                );

                return;
            }


            initialize();


        } catch (e) {

            log.error(
                'Initialisierungsfehler:',
                e
            );


            setTimeout(
                waitForGame,
                1000
            );
        }
    }


    // =========================================================
    // INITIALISIERUNG
    // =========================================================

    function initialize() {

        addScriptsMenuEntry();

        scheduleNextSnapshot();


        log.success(
            `${scriptName} gestartet`
        );


        log.info(
            'Ranking wird erst nach Auswahl im Scripte-Menü geöffnet.'
        );
    }


    // =========================================================
    // START
    // =========================================================

    waitForGame();

})();
