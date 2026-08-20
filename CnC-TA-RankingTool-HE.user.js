// ==UserScript==
// @name         CnC-TA RankingTool - HE
// @namespace    Harzi
// @version      1.5.25
// @description  C&C-TA Spieler-, Allianz- und Daily-Ranking mit Rangbereich, Spielersuche und Tages-Snapshot
// @icon         https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/rankingtool-icon.png
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/CnC-TA-RankingTool-HE.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-RankingTool-HE/main/CnC-TA-RankingTool-HE.user.js
// @author       Harzi
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        none
// ==/UserScript==


// Neu in Version 1.5.25
// Bereiche Spieler-Ranking & Allianz-Ranking entfernt
// Spieler-Ranking auf 1000 erhöht.
// Neue Funktion "Startspieler" hinzugefügt
// Neue Funktion "Startrange" hinzugefügt
// Tooltipps für die neuen Bereiche erstellt.
// Implementierung von Englisch, Französich und Spanisch

(function () {
    'use strict';

    const translations = {

        de: {
            startPlayer: ('Startspieler'),
            fromRank: 'Von Rang:',
            toRank: 'Bis Rang:',
            update: 'Aktualisieren',
            save: 'Speichern',
            player: 'Spieler:',
            search: 'Suchen',
            dailyRanking:
            'Daily-Ranking: Einstellbar bis Top 1000 Spieler und Top 25 Allianzen',
            playersTop: 'Spieler – Top 1000',
            alliancesTop: 'Allianzen – Top 25',
            playerRange: 'Spieler – Rangbereich',
            rank: 'Rang',
            playerColumn: 'Spieler',
            allianceColumn: 'Allianz',
            snapshot: 'Snapshot',
            currentPoints: 'Punkte aktuell',
            change: 'Änderung',
            automatic: 'Automatik',
            automaticActive: 'Automatik aktiv',
            automaticInactive: 'Automatik inaktiv',
            time: 'Uhrzeit:',
            snapshotNow: 'Snapshot jetzt',
            lastSnapshot: 'Letzter Snapshot:',
            automaticTooltip:
            'Automatischer Tages-Snapshot <br>' +
            'zur eingestellten Uhrzeit<br>' +
            'aktivieren/deaktivieren.',
            timeTooltip:
            'Uhrzeit festlegen, zu der der automatische <br>' +
            'Tages-Snapshot ausgelöst wird.',
            saveTooltip:
            'Auslösen eines automatischen Snapshot zur eingestellten Uhrzeit.<br>' +
            '<span style="color:red; font-weight:bold;">Achtung!</span> ' +
            'Du musst zur eingestellten Auslösezeit im Spiel sein!',
            snapshotNowTooltip:
            'Es wird ein sofortiger Snapshot ausgeführt,<br>' +
            'welcher bis zur erneuten manuellen oder automatischen Auslösung gespeichert wird.',
            updateTooltip:
            'Aktualisiert das Daily-Ranking mit dem eingestellten Rangbereich und speichert diesen für den nächsten Start.',
            startPlayerTooltip:
            'Gibt den Spieler an, zu dem beim Öffnen des Daily-Rankings automatisch gesprungen wird.<br>' +
            '<span style="color:red; font-weight:bold;">Achtung!</span> ' +
            'Der Spieler muss innerhalb des gewählten Rangebereichs liegen. ' +
            'Erfolgt keine Angabe oder ist der Spieler außerhalb des Rangebereichs, wird zu Rang 1 gesprungen.',

        },

        en: {
            startPlayer: 'Start player:',
            fromRank: 'From rank:',
            toRank: 'To rank:',
            update: 'Update',
            save: 'Save',
            player: 'Player:',
            search: 'Search',
            dailyRanking:
            'Daily Ranking: Adjustable up to Top 1000 Players and Top 25 Alliances',
            playersTop: 'Players – Top 1000',
            alliancesTop: 'Alliances – Top 25',
            playerRange: 'Players – Rank range',
            rank: 'Rank',
            playerColumn: 'Player',
            allianceColumn: 'Alliance',
            snapshot: 'Snapshot',
            currentPoints: 'Current points',
            change: 'Change',
            automatic: 'Automatic',
            automaticActive: 'Automatic active',
            automaticInactive: 'Automatic inactive',
            time: 'Time:',
            snapshotNow: 'Snapshot now',
            lastSnapshot: 'Last snapshot:',
            automaticTooltip:
            'Automatic daily snapshot<br>' +
            'at the set time<br>' +
            'enable/disable.',
            timeTooltip:
            'Set the time at which the automatic <br>' +
            'daily snapshot is triggered.',
            saveTooltip:
            'Triggers an automatic snapshot at the set time.<br>' +
            '<span style="color:red; font-weight:bold;">Warning!</span> ' +
            'You must be in the game at the scheduled trigger time!',
            snapshotNowTooltip:
            'An immediate snapshot is performed,<br>' +
            'which is saved until the next manual or automatic trigger.',
            updateTooltip:
            'Updates the Daily Ranking with the selected rank range and saves it for the next start.',
            startPlayerTooltip:
            'Specifies the player to jump to when opening the Daily Ranking.<br>' +
            '<span style="color:red; font-weight:bold;">Warning!</span> ' +
            'The player must be within the selected rank range. ' +
            'If no player is specified or the player is outside the rank range, rank 1 is selected.',

        },

        fr: {
            startPlayer: 'Joueur de départ :',
            fromRank: 'Du rang :',
            toRank: 'Au rang :',
            update: 'Actualiser',
            save: 'Enregistrer',
            player: 'Joueur :',
            search: 'Rechercher',
            dailyRanking:
            'Classement quotidien : réglable jusqu’aux 1000 meilleurs joueurs et 25 meilleures alliances',
            playersTop: 'Joueurs – Top 1000',
            alliancesTop: 'Alliances – Top 25',
            playerRange: 'Joueurs – Plage de classement',
            rank: 'Rang',
            playerColumn: 'Joueur',
            allianceColumn: 'Alliance',
            snapshot: 'Snapshot',
            currentPoints: 'Points actuels',
            change: 'Variation',
            automatic: 'Automatique',
            automaticActive: 'Automatique active',
            automaticInactive: 'Automatique inactive',
            time: 'Heure :',
            snapshotNow: 'Snapshot maintenant',
            lastSnapshot: 'Dernier snapshot :',
            automaticTooltip:
            'Snapshot quotidien automatique<br>' +
            'à l’heure définie<br>' +
            'activer/désactiver.',
            timeTooltip:
            'Définir l’heure à laquelle le <br>' +
            'snapshot quotidien automatique est déclenché.',
            saveTooltip:
            'Déclenche un snapshot automatique à l’heure définie.<br>' +
            '<span style="color:red; font-weight:bold;">Attention !</span> ' +
            'Tu dois être dans le jeu à l’heure du déclenchement !',
            snapshotNowTooltip:
            'Un snapshot immédiat est effectué,<br>' +
            'et conservé jusqu’au prochain déclenchement manuel ou automatique.',
            updateTooltip:
            'Actualise le classement quotidien avec la plage de classement sélectionnée et l’enregistre pour le prochain démarrage.',
            startPlayerTooltip:
            'Indique le joueur vers lequel accéder automatiquement à l’ouverture du classement quotidien.<br>' +
            '<span style="color:red; font-weight:bold;">Attention !</span> ' +
            'Le joueur doit se trouver dans la plage de classement sélectionnée. ' +
            'Si aucun joueur n’est indiqué ou si le joueur est en dehors de la plage, le rang 1 est sélectionné.',

        },

        es: {
            startPlayer: 'Jugador inicial:',
            fromRank: 'Desde rango:',
            toRank: 'Hasta rango:',
            update: 'Actualizar',
            save: 'Guardar',
            player: 'Jugador:',
            search: 'Buscar',
            dailyRanking:
            'Clasificación diaria: configurable hasta los 1000 mejores jugadores y las 25 mejores alianzas',
            playersTop: 'Jugadores – Top 1000',
            alliancesTop: 'Alianzas – Top 25',
            playerRange: 'Jugadores – Rango',
            rank: 'Rango',
            playerColumn: 'Jugador',
            allianceColumn: 'Alianza',
            snapshot: 'Snapshot',
            currentPoints: 'Puntos actuales',
            change: 'Cambio',
            automatic: 'Automático',
            automaticActive: 'Automático activo',
            automaticInactive: 'Automático inactivo',
            time: 'Hora:',
            snapshotNow: 'Snapshot ahora',
            lastSnapshot: 'Último snapshot:',
            automaticTooltip:
            'Snapshot diario automático<br>' +
            'a la hora establecida<br>' +
            'activar/desactivar.',
            timeTooltip:
            'Establecer la hora a la que se activa <br>' +
            'el snapshot diario automático.',
            saveTooltip:
            'Activa un snapshot automático a la hora establecida.<br>' +
            '<span style="color:red; font-weight:bold;">¡Atención!</span> ' +
            'Debes estar en el juego a la hora programada.',
            snapshotNowTooltip:
            'Se realiza un snapshot inmediato,<br>' +
            'que se conserva hasta la próxima activación manual o automática.',
            updateTooltip:
            'Actualiza la clasificación diaria con el rango seleccionado y lo guarda para el próximo inicio.',
            startPlayerTooltip:
            'Indica el jugador al que se accederá automáticamente al abrir la clasificación diaria.<br>' +
            '<span style="color:red; font-weight:bold;">¡Atención!</span> ' +
            'El jugador debe estar dentro del rango seleccionado. ' +
            'Si no se indica ningún jugador o está fuera del rango, se selecciona el rango 1.',


        }
    };

    function t(key) {

        const language =
              localStorage.getItem(
                  'HCTAT_DailyRanking_Language'
              ) || 'de';

        return (
            translations[language] &&
            translations[language][key]
        ) ||
            translations.de[key] ||
            key;
    }

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
                .slice(0, 1000)
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
                t('lastSnapshot') + ' noch keiner'
            );
            return;
        }


        snapshotStatusLabel.setValue(
            `${t('lastSnapshot')} ${snapshot.date} ${snapshot.time}`
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

                    lastIndex: 999,

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
                'RankingGetData für Top 1000 wurde als Tages-Snapshot gesendet.'
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
                    lastIndex: 999,
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
                  t('automatic')
              );

        snapshotAutoCheckBox.set({
            textColor: '#ffff00'
        });

        snapshotAutoCheckBox.setToolTipText(
            '<div style="width:180px; white-space:normal;">' +
            t('automaticTooltip') +
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
                ? t('automaticActive')
                : t('automaticInactive')
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
                  t('time')
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
            t('timeTooltip') +
            '</div>'
        );

        const snapshotSaveButton =
              new qx.ui.form.Button(
                  t('save')
              );


        snapshotSaveButton.set({
            width: 75,
            height: 26
        });

        snapshotSaveButton.setToolTipText(
            '<div style="width:210px; white-space:normal;">' +
            t('saveTooltip') +
            '</div>'
        );

        const snapshotNowButton =
              new qx.ui.form.Button(
                  t('snapshotNow')
              );


        snapshotNowButton.set({
            width: 95,
            height: 26
        });

        snapshotNowButton.setToolTipText(
            '<div style="width:300px; white-space:normal;">' +
            t('snapshotNowTooltip') +
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
                  t('dailyRanking')
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
                  t('player')
              );

        dailySearchLabel.set({
            textColor: '#ffff00'
        });


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
                  t('search')
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
        // Gespeicherten Spieler-Rangbereich laden
        // -----------------------------------------------------

        const savedDailyFrom =
              parseInt(
                  localStorage.getItem(
                      'HCTAT_DailyRanking_From'
                  ),
                  10
              ) || 1;

        const savedDailyTo =
              parseInt(
                  localStorage.getItem(
                      'HCTAT_DailyRanking_To'
                  ),
                  10
              ) || 1000;

        // -----------------------------------------------------
        // Spieler-Rangbereich im Daily-Ranking
        // -----------------------------------------------------

        const dailyRangeContainer =
              new qx.ui.container.Composite(
                  new qx.ui.layout.HBox(6)
              );

        const dailyRangeSpacer =
              new qx.ui.core.Spacer();

        dailyRangeContainer.add(
            dailyRangeSpacer,
            {
                flex: 1
            }
        );

        const dailyFromLabel =
              new qx.ui.basic.Label(
                  t('fromRank')
              );

        dailyFromLabel.set({
            textColor: '#ffff00'
        });

        const dailyFromField =
              new qx.ui.form.TextField(
                  String(savedDailyFrom)
              );

        dailyFromField.set({
            width: 55,
            height: 26
        });

        const dailyToLabel =
              new qx.ui.basic.Label(
                  t('toRank')
              );

        dailyToLabel.set({
            textColor: '#ffff00'
        });

        const dailyToField =
              new qx.ui.form.TextField(
                  String(savedDailyTo)
              );

        dailyToField.set({
            width: 55,
            height: 26
        });

        const dailyRangeButton =
              new qx.ui.form.Button(
                  t('update')
              );

        dailyRangeButton.set({
            width: 85,
            height: 26
        });

        dailyRangeButton.setToolTipText(
            '<div style="width:300px; white-space:normal;">' +
            t('updateTooltip') +
            '</div>'
        );

        // -----------------------------------------------------
        // Gespeicherter Startspieler
        // -----------------------------------------------------

        const savedDailyStartPlayer =
              localStorage.getItem(
                  'HCTAT_DailyRanking_StartPlayer'
              ) || '';

        const dailyStartPlayerLabel =
              new qx.ui.basic.Label(
                  t('startPlayer')
              );

        dailyStartPlayerLabel.set({
            textColor: '#ffff00'
        });

        const dailyStartPlayerField =
              new qx.ui.form.TextField(
                  savedDailyStartPlayer
              );

        dailyStartPlayerField.set({
            width: 120,
            height: 26
        });

        dailyStartPlayerField.setToolTipText(
            '<div style="width:300px; white-space:normal;">' +
            t('startPlayerTooltip') +
            '</div>'
        );

        const dailyStartPlayerButton =
              new qx.ui.form.Button(
                  t('save')
              );

        dailyStartPlayerButton.set({
            width: 75,
            height: 26
        });


        // -----------------------------------------------------
        // Übersetzung abrufen
        // -----------------------------------------------------

        function t(key) {

            const language =
                  localStorage.getItem(
                      'HCTAT_DailyRanking_Language'
                  ) || 'de';

            return (
                translations[language] &&
                translations[language][key]
            ) ||
                translations.de[key] ||
                key;
        }

        // -----------------------------------------------------
        // Sprachauswahl
        // -----------------------------------------------------

        const savedLanguage =
              localStorage.getItem(
                  'HCTAT_DailyRanking_Language'
              ) || 'de';

        const languageSelect =
              new qx.ui.form.SelectBox();

        const languageHeader =
              new qx.ui.form.ListItem(
                  'Language'
              );

        languageHeader.setEnabled(false);

        const languageGerman =
              new qx.ui.form.ListItem(
                  'Deutsch'
              );

        const languageEnglish =
              new qx.ui.form.ListItem(
                  'English'
              );

        const languageFrench =
              new qx.ui.form.ListItem(
                  'Français'
              );

        const languageSpanish =
              new qx.ui.form.ListItem(
                  'Español'
              );

        const languageMap = {
            de: languageGerman,
            en: languageEnglish,
            fr: languageFrench,
            es: languageSpanish
        };

        languageSelect.add(
            languageHeader
        );

        languageSelect.add(
            languageGerman
        );

        languageSelect.add(
            languageEnglish
        );

        languageSelect.add(
            languageFrench
        );

        languageSelect.add(
            languageSpanish
        );

        languageSelect.set({
            width: 100,
            height: 26
        });

        // Deutsch zunächst als Standard anzeigen

        languageSelect.setSelection([
            languageMap[savedLanguage] ||
            languageHeader
        ]);

        dailyStartPlayerButton.addListener(
            'execute',
            function () {

                const playerName =
                      dailyStartPlayerField
                .getValue()
                .trim();

                localStorage.setItem(
                    'HCTAT_DailyRanking_StartPlayer',
                    playerName
                );
            }
        );


        languageSelect.addListener(
            'changeSelection',
            function (e) {

                const selection =
                      e.getData();

                if (
                    !selection ||
                    !selection.length ||
                    selection[0] === languageHeader
                ) {
                    return;
                }

                let language = '';

                if (selection[0] === languageGerman) {
                    language = 'de';
                } else if (
                    selection[0] === languageEnglish
                ) {
                    language = 'en';
                } else if (
                    selection[0] === languageFrench
                ) {
                    language = 'fr';
                } else if (
                    selection[0] === languageSpanish
                ) {
                    language = 'es';
                }

                if (language) {

                    localStorage.setItem(
                        'HCTAT_DailyRanking_Language',
                        language
                    );

                    setTimeout(
                        function () {
                            updateLanguageUI();
                        },
                        0
                    );
                }
            }
        );

        // =====================================================
        // SPRACHE SOFORT AKTUALISIEREN – TEST 1
        // =====================================================

        function updateLanguageUI() {

            dailyInfoLabel.setValue(
                t('dailyRanking')
            );

            dailyPlayerLabel.setValue(
                t('playersTop')
            );

            dailyAllianceLabel.setValue(
                t('alliancesTop')
            );

            dailyStartPlayerLabel.setValue(
                t('startPlayer')
            );

            dailyFromLabel.setValue(
                t('fromRank')
            );

            dailyToLabel.setValue(
                t('toRank')
            );

            dailyRangeButton.setLabel(
                t('update')
            );

            dailyStartPlayerButton.setLabel(
                t('save')
            );

            dailySearchLabel.setValue(
                t('player')
            );

            dailySearchButton.setLabel(
                t('search')
            );

            snapshotAutoCheckBox.setLabel(
                t('automatic')
            );

            snapshotTimeLabel.setValue(
                t('time')
            );

            snapshotSaveButton.setLabel(
                t('save')
            );

            snapshotNowButton.setLabel(
                t('snapshotNow')
            );

            renderDailyRanking();

            updateSnapshotStatusLabel();

            updateSnapshotAutoStatusLabel();

            snapshotAutoCheckBox.setToolTipText(
                '<div style="width:180px; white-space:normal;">' +
                t('automaticTooltip') +
                '</div>'
            );

            snapshotTimeField.setToolTipText(
                '<div style="width:230px; white-space:normal;">' +
                t('timeTooltip') +
                '</div>'
            );

            snapshotSaveButton.setToolTipText(
                '<div style="width:230px; white-space:normal;">' +
                t('saveTooltip') +
                '</div>'
            );

            snapshotNowButton.setToolTipText(
                '<div style="width:210px; white-space:normal;">' +
                t('snapshotNowTooltip') +
                '</div>'
            );

            dailyStartPlayerField.setToolTipText(
                '<div style="width:300px; white-space:normal;">' +
                t('startPlayerTooltip') +
                '</div>'
            );

            dailyRangeButton.setToolTipText(
                '<div style="width:300px; white-space:normal;">' +
                t('updateTooltip') +
                '</div>'
            );

        }

        // =====================================================
        dailyRangeButton.addListener(
            'execute',
            function () {

                let from =
                    parseInt(
                        dailyFromField.getValue(),
                        10
                    );

                let to =
                    parseInt(
                        dailyToField.getValue(),
                        10
                    );

                if (isNaN(from)) {
                    from = 1;
                }

                if (isNaN(to)) {
                    to = 1000;
                }

                from = Math.max(
                    1,
                    Math.min(1000, from)
                );

                to = Math.max(
                    1,
                    Math.min(1000, to)
                );

                if (from > to) {
                    const temp = from;
                    from = to;
                    to = temp;
                }

                dailyFromField.setValue(
                    String(from)
                );

                dailyToField.setValue(
                    String(to)
                );

                localStorage.setItem(
                    'HCTAT_DailyRanking_From',
                    String(from)
                );

                localStorage.setItem(
                    'HCTAT_DailyRanking_To',
                    String(to)
                );

                renderDailyRanking();
            }
        );

        dailyRangeContainer.add(
            dailyStartPlayerLabel
        );

        dailyRangeContainer.add(
            dailyStartPlayerField
        );

        dailyRangeContainer.add(
            dailyStartPlayerButton
        );

        dailyRangeContainer.add(
            languageSelect
        );

        // Abstand zwischen den beiden Bereichen
        dailyRangeContainer.add(
            dailyRangeSpacer,
            {
                flex: 1
            }
        );


        dailyRangeContainer.add(
            dailyFromLabel
        );

        dailyRangeContainer.add(
            dailyFromField
        );

        dailyRangeContainer.add(
            dailyToLabel
        );

        dailyRangeContainer.add(
            dailyToField
        );

        dailyRangeContainer.add(
            dailyRangeButton
        );

        dailyContent.add(
            dailyRangeContainer
        );

        // -----------------------------------------------------
        // Spieler Daily-Ranking
        // -----------------------------------------------------

        const dailyPlayerLabel =
              new qx.ui.basic.Label(
                  t('playersTop')
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
            t('rank'),
            t('playerColumn'),
            t('allianceColumn'),
            t('snapshot'),
            t('currentPoints'),
            t('change')
        ]);


        const dailyPlayerTable =
              new qx.ui.table.Table(
                  dailyPlayerModel
              );

        dailyPlayerTable.set({
            width: 730,
            height: 240,
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

        // =====================================================
        // Gespeicherten Startspieler automatisch anspringen
        // =====================================================

        function jumpToSavedDailyStartPlayer() {

            const savedPlayer =
                  localStorage.getItem(
                      'HCTAT_DailyRanking_StartPlayer'
                  );

            if (!savedPlayer) {
                return;
            }

            const searchText =
                  savedPlayer
            .trim()
            .toLowerCase();

            if (!searchText) {
                return;
            }

            const rowCount =
                  dailyPlayerModel.getRowCount();

            let foundIndex = -1;

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
                      );

                if (
                    playerName
                    .trim()
                    .toLowerCase() === searchText
                ) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex === -1) {
                return;
            }

            const selectionModel =
                  dailyPlayerTable
            .getSelectionModel();

            selectionModel.setSelectionInterval(
                foundIndex,
                foundIndex
            );

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
        }


        // -----------------------------------------------------
        // Allianz Daily-Ranking
        // -----------------------------------------------------

        const dailyAllianceLabel =
              new qx.ui.basic.Label(
                  t('alliancesTop')
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
            t('rank'),
            t('allianceColumn'),
            t('snapshot'),
            t('currentPoints'),
            t('change')
        ]);


        const dailyAllianceTable =
              new qx.ui.table.Table(
                  dailyAllianceModel
              );

        dailyAllianceTable.set({
            width: 730,
            height: 240,
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


        // -----------------------------------------------------
        // Spaltenbreiten Daily-Ranking
        // -----------------------------------------------------

        const dailyPlayerColumnModel =
              dailyPlayerTable.getTableColumnModel();

        // Rang
        dailyPlayerColumnModel.setColumnWidth(
            0,
            45
        );

        // Spieler
        dailyPlayerColumnModel.setColumnWidth(
            1,
            120
        );

        // Allianz
        dailyPlayerColumnModel.setColumnWidth(
            2,
            120
        );

        // Snapshot
        dailyPlayerColumnModel.setColumnWidth(
            3,
            125
        );

        // Punkte aktuell
        dailyPlayerColumnModel.setColumnWidth(
            4,
            125
        );

        // Änderung
        dailyPlayerColumnModel.setColumnWidth(
            5,
            145
        );


        // -----------------------------------------------------
        // Spaltenbreiten Daily-Allianz-Ranking
        // -----------------------------------------------------

        const dailyAllianceColumnModel =
              dailyAllianceTable.getTableColumnModel();

        // Rang
        dailyAllianceColumnModel.setColumnWidth(
            0,
            45
        );

        // Allianz
        dailyAllianceColumnModel.setColumnWidth(
            1,
            170
        );

        // Snapshot
        dailyAllianceColumnModel.setColumnWidth(
            2,
            125
        );

        // Punkte aktuell
        dailyAllianceColumnModel.setColumnWidth(
            3,
            145
        );

        // Änderung
        dailyAllianceColumnModel.setColumnWidth(
            4,
            145
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

            const dailyFrom =
                  Math.max(
                      1,
                      Math.min(
                          1000,
                          parseInt(
                              dailyFromField.getValue(),
                              10
                          ) || 1
                      )
                  );

            const dailyTo =
                  Math.max(
                      dailyFrom,
                      Math.min(
                          1000,
                          parseInt(
                              dailyToField.getValue(),
                              10
                          ) || 1000
                      )
                  );

            dailyPlayerLabel.setValue(
                t('playerRange') +
                ' ' +
                dailyFrom +
                ' – ' +
                dailyTo
            );

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
            ? `${t('snapshot')} (${snapshotTime})`
    : t('snapshot');


            if (dailyPlayerModel) {

                dailyPlayerModel.setColumns([
                    t('rank'),
                    t('playerColumn'),
                    t('allianceColumn'),
                    snapshotHeader,
                    t('currentPoints'),
                    t('change')
                ]);
            }


            if (dailyAllianceModel) {

                dailyAllianceModel.setColumns([
                    t('rank'),
                    t('allianceColumn'),
                    snapshotHeader,
                    t('currentPoints'),
                    t('change')
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


                const dailyFrom =
                      Math.max(
                          1,
                          Math.min(
                              1000,
                              parseInt(
                                  dailyFromField.getValue(),
                                  10
                              ) || 1
                          )
                      );

                const dailyTo =
                      Math.max(
                          dailyFrom,
                          Math.min(
                              1000,
                              parseInt(
                                  dailyToField.getValue(),
                                  10
                              ) || 1000
                          )
                      );

                const playerRows =
                      playerNames
                .slice(
                    dailyFrom - 1,
                    dailyTo
                )
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

            jumpToSavedDailyStartPlayer();
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
