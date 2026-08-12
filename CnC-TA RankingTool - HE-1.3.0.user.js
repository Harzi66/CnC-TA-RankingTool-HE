// ==UserScript==
// @name         CnC-TA RankingTool - HE
// @namespace    Harzi
// @version      1.3.0
// @description  Zeigt die C&C-TA-Spielerrangliste bis Rang 50 an
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

    function showRanking(players) {

        log.section('RANKING ANZEIGE');

        const previousPoints =
              loadPreviousPoints();


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

                requestPlayerRanking();

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


        tabBar.add(playerTab);
        tabBar.add(allianceTab);

        allianceTab.addListener(
            'execute',
            function () {

                rangeContainer.setVisibility(
                    'excluded'
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

        // =====================================================
        // TABELLENMODELL
        // =====================================================

        const tableModel =
              new qx.ui.table.model.Simple();


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

    function requestPlayerRanking() {

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
                            data.p
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


                    requestPlayerRanking();
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