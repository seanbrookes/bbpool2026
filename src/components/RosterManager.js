import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { CONSTANTS } from '../constants';
import { StarterPosContainer } from './StarterPosContainer';
import { ClosersPosContainer } from './CloserPosContainer';
import { HitterPosContainer } from './HitterPosContainer';

import {
  getPositionScoreData,
  getRawPosTypeScoreData,
  getRosterTotals,
} from './roster_helpers';

const PlayerGroupTable = styled.table`

  margin: 0 2rem 0 2rem;
  td {
    border-bottom: 1px solid #dddddd;
    font-size: 15px;
  }



`;

const RosterPosTypeContainer = styled.div`
  border: 1px solid #cccccc;
  padding: .1rem;
`;

const ScoreContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  color: #555555;
`;
const ScoreValue = styled.div`
font-size: 12px;
font-weight: 600;
color: #444444;
margin-left: 6px;
margin-right: 1rem;
`;

const RosterManagerContainer = styled.div`
  border-bottom: 1px solid #eeeeee;
  padding: .1rem;
  font-family: arial sans-serif;
  display: block;
`;

const RosterTitle = styled.h2`
  font-size: 16px;
  color: #6d0000;
  background-color: #eeeeee;
  text-transform: capitalize;

`;

const PosLabel = styled.div`
  font-size: 9px;
  color: #777777;
  text-align: left;
`;


const HitterPosTable = styled.table`
  margin: .75rem .8rem 0 .8rem;

  th {
    border-bottom: 1px solid #eeeeee;
    font-size: 11px;
  }
  border-bottom: 1px solid #dddddd;


  caption {
    text-align: left;
    font-size: 10px;
    font-weight: 600;
  }
`;

const NameCell = styled.div`
  width: 100px;
  font-size: 12px;
`;
const TeamCell = styled.div`
  width: 30px;
  font-size: 9px;
  text-align: left;
`;
const RunsCell = styled.div`
  font-size: 11px;
  width: 22px;
  text-align: center;
`;
const HitsCell = styled.div`
font-size: 11px;
width: 22px;
text-align: center;
`;
const HRCell = styled.div`
font-size: 11px;
text-align: center;
width: 22px;
`;
const RBICell = styled.div`
font-size: 11px;
text-align: center;
width: 22px;
`;
const SBCell = styled.div`
font-size: 11px;
width: 22px;
text-align: center;
`;
const TotalCell = styled.div`
font-size: 12px;
text-align: left;
width: 22px;
font-weight: 600;
`;

const posList = [
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'OF',
  'DH',
  'SP',
  'RP'
];

// used to spoof the logic when a player has no stats
const randomPlayerId = () => {
  return Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)
};

const getHitterTotal = (hitter) => {
  if (!hitter.playerId) {
    return 0;
  }
  return (hitter.runs) + (hitter.hits / 2) + (hitter.rbi) + (hitter.homeRuns * 2) + (hitter.stolenBases / 2);;
};

export const RosterManager = ({mlbHitters, mlbPitchers, roster = {}, saveRosters, isHiddenOn, onUpdateRosterTotal}) => {
  const [targetNewPlayer, setTargetNewPlayer] = useState(null);
  const [currentRosterScoreData, setCurrentRosterScoreData] = useState(null);
  const [currentRawScoreData, setCurrentRawScoreData] = useState(null);
  const [currentRoster, setCurrentRoster] = useState(null);
  const [rosterHittersTotal, setRosterHittersTotal] = useState(0);
  const [rosterClosersTotal, setRosterClosersTotal] = useState(0);
  const [rosterStartersTotal, setRosterStartersTotal] = useState(0);
  const [rosterOutfieldTotal, setRosterOutfieldTotal] = useState(0);
  const [rosterCatcherTotal, setRosterCatcherTotal] = useState(0);
  const [roster1BTotal, setRoster1BTotal] = useState(0);
  const [roster2BTotal, setRoster2BTotal] = useState(0);
  const [roster3BTotal, setRoster3BTotal] = useState(0);
  const [rosterSSTotal, setRosterSSTotal] = useState(0);
  const [rosterDHTotal, setRosterDHTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {

    if (roster && roster.players) {
      let rawPosTypeScoreData = getRawPosTypeScoreData(roster, mlbHitters, mlbPitchers);
      let positionScoreData = getPositionScoreData(roster, mlbHitters, mlbPitchers);

      setCurrentRosterScoreData(positionScoreData);
      setCurrentRawScoreData(rawPosTypeScoreData);
      setCurrentRoster({...roster});
    }
  }, [roster, mlbHitters, mlbPitchers]);
  
  useEffect(() => {
    // console.log('|');
    // console.log(`| RosterManager slug[${roster.slug}] roster.total[${roster.total}] grandTotal[${grandTotal}]`);
    // console.log('|');
    onUpdateRosterTotal(roster.slug, grandTotal);
  }, [grandTotal]);

  useEffect(() => {

    if (currentRoster) {
      const positionTotals = getRosterTotals(currentRoster);

      // if (positionTotals['SP']) {
        setRosterStartersTotal(positionTotals['SP']);
      // }
      // if (positionTotals['RP']) {
        setRosterClosersTotal(positionTotals['RP']);
      // }
      // if (positionTotals['OF']) {
        setRosterOutfieldTotal(positionTotals['OF']);
      // }
      // else {
        setRosterCatcherTotal(positionTotals['C']);
        setRoster1BTotal(positionTotals['1B']);
        setRoster2BTotal(positionTotals['2B']);
        setRoster3BTotal(positionTotals['3B']);
        setRosterSSTotal(positionTotals['SS']);
        setRosterDHTotal(positionTotals['DH']);
      // }
  
    }
    // else {
    //   console.log('| no current roster on set totals calls');
    // }



  }, [currentRoster, currentRosterScoreData]);

  useEffect(() => {

    const runningHitterTotal =  Number(rosterOutfieldTotal) + Number(rosterCatcherTotal) + Number(roster1BTotal) + Number(roster2BTotal) + Number(roster3BTotal) + Number(rosterSSTotal) + Number(rosterDHTotal);

    setRosterHittersTotal(runningHitterTotal);
  }, [
    rosterOutfieldTotal,
    rosterCatcherTotal,
    roster1BTotal,
    roster2BTotal,
    roster3BTotal,
    rosterSSTotal,
    rosterDHTotal
  ])
  useEffect(() => {
    if (rosterHittersTotal && rosterStartersTotal && rosterClosersTotal) {

      const theTotal = rosterHittersTotal + rosterStartersTotal + rosterClosersTotal;

      setGrandTotal(theTotal);
  
    }
  }, [rosterHittersTotal, rosterStartersTotal, rosterClosersTotal]);

  const hitters = roster.players.filter((player) => {
    if (player.posType === 'pitcher' && player.pos === 'CF') {
      player.posType = 'hitter';
    }
    return player.posType === 'hitter';
  });
  const starters = roster.players.filter((player) => {
    return player.pos.toLowerCase() === 'sp';
  });
  const closers = roster.players.filter((player) => {
    return player.pos.toLowerCase() === 'rp';
  });


  const onTriggerDeletePlayer = (event, targetPlayer) => {
   if (window.confirm(`delete ${targetPlayer.name}?`)) {
      console.log(`| delete this player ${targetPlayer.name}`);
      const updatedRoster = {...roster};
      updatedRoster.players = roster.players.filter((rosterPlayer) => {
        return rosterPlayer.name !== targetPlayer.name;
      });

      saveRosters(updatedRoster);

    }
  };

  const onCreatePlayer = () => {
    const targetPlayer = {...targetNewPlayer};
    const updatedRoster = {...roster};
    // draftStatus: "protected"
    // index: 27
    // mlbid: "592518"
    // name: "Manny Machado"
    // pos: "3B"
    // posType: "hitter"
    // roster: "bashers"
    // status: "protected"
    // team: "BAL"

    targetPlayer.posType = 'hitter';
    if (targetPlayer.pos === 'SP' || targetPlayer.pos === 'RP') {
      targetPlayer.posType = 'pitcher';
    }
    targetPlayer.status = 'regular';
    targetPlayer.roster = roster.roster;


    updatedRoster.players.push(targetPlayer);

    saveRosters(updatedRoster);
    setTargetNewPlayer(null);
  };

  const onUpdateNewPlayerProperty = (event, property) => {
    const targetPlayer = {...targetNewPlayer};
    targetPlayer[property] = event.target.value;

    setTargetNewPlayer(targetPlayer);
  };

  const onUpdatePlayerTeam = (event, player) => {
    const updatedRoster = {...roster};
    updatedRoster.players.map((rosterPlayer) => {
      if (rosterPlayer.name === player.name) {
        rosterPlayer.team = event.target.value;
      }
    });

    saveRosters(updatedRoster);
  };

  const onUpdatePlayerPos = (event, player) => {
    const updatedRoster = {...roster};
    updatedRoster.players.map((rosterPlayer) => {
      if (rosterPlayer.name === player.name) {
        rosterPlayer.pos = event.target.value;
      }
    });

    saveRosters(updatedRoster);
  };

  const hitterPosList = [
    'C',
    '1B',
    '2B',
    '3B',
    'SS',
    'OF',
    'DH',
  ];


  return (
    <RosterManagerContainer id={roster.slug}>
      <RosterTitle>{roster.slug} [{grandTotal}]</RosterTitle>
      <RosterPosTypeContainer>
        {
          hitterPosList.map((posKey, index) => {
            if (!currentRosterScoreData) {
              return null; 
            }
            return (
              <HitterPosContainer key={index} hittersBlob={currentRosterScoreData} pos={posKey} roster={roster.slug} />
            ); 

          })
        }
        <ScoreContainer>
          <ScoreLabel>Hitters:</ScoreLabel><ScoreValue>{parseFloat(rosterHittersTotal).toFixed(2)}</ScoreValue>
        </ScoreContainer>
      </RosterPosTypeContainer>
      <RosterPosTypeContainer>
        {currentRosterScoreData && <StarterPosContainer startersBlob={currentRosterScoreData} roster={roster.slug} />}
        <ScoreContainer>
          <ScoreLabel>Starters:</ScoreLabel><ScoreValue>{parseFloat(rosterStartersTotal).toFixed(2)}</ScoreValue>
        </ScoreContainer>
      </RosterPosTypeContainer>
      <RosterPosTypeContainer>
        {currentRosterScoreData && <ClosersPosContainer pitchersBlob={currentRosterScoreData} roster={roster.slug} />}
        <ScoreContainer>
          <ScoreLabel>Closers:</ScoreLabel><ScoreValue>{parseFloat(rosterClosersTotal).toFixed(2)}</ScoreValue>
        </ScoreContainer>
      </RosterPosTypeContainer>
      <ScoreContainer>
          <ScoreLabel>Grand Total:</ScoreLabel><ScoreValue>{grandTotal}</ScoreValue>
        </ScoreContainer>
      {isHiddenOn && <div>
`        <PlayerGroupTable>
          <caption style={{background: '#f4f4f4', color: '#444444', textAlign:'left', textTransform: 'uppercase'}}>hitters</caption>
          <tbody>
          {hitters.map((player, index) => {
            const currentHitter = player && currentRawScoreData && currentRawScoreData['hitters'] && currentRawScoreData['hitters'][player.playerId] && currentRawScoreData['hitters'][player.playerId];
            player.total = currentHitter ? getHitterTotal(currentHitter) : 0;
            return (
              <tr key={index}>
                <td>
                  {isHiddenOn && <button onClick={(event) => {return onTriggerDeletePlayer(event, player)}}>X</button>}
                </td>
                <td>
                  {isHiddenOn && player.mlbid}
                </td>
                <td style={{color: 'darkblue', whiteSpace: 'nowrap'}}>
                  {player.name}
                </td>
                <td>
                {isHiddenOn ? <select
                    onChange={(event) => onUpdatePlayerPos(event, player)}
                    className="select-pos pick-property-edit"
                    value={player.pos}
                    data-property="pos"
                  >
                    <option value>-</option>
                    <option value="C">C</option>
                    <option value="1B">1B</option>
                    <option value="2B">2B</option>
                    <option value="3B">3B</option>
                    <option value="SS">SS</option>
                    <option value="LF">LF</option>
                    <option value="CF">CF</option>
                    <option value="RF">RF</option>
                    <option value="DH">DH</option>
                    <option value="SP">SP</option>
                    <option value="RP">RP</option>
                  </select> : player.pos}
                </td>
                <td>
                {isHiddenOn ? <select
                    className="select-team pick-property-edit"
                    onChange={(event) => onUpdatePlayerTeam(event, player)}
                    value={player.team}
                    data-property="team"
                  >
                    <option value>--</option>
                    <option value="BAL">BAL</option>
                    <option value="BOS">BOS</option>
                    <option value="CHA">CHA</option>
                    <option value="CLE">CLE</option>
                    <option value="DET">DET</option>
                    <option value="HOU">HOU</option>
                    <option value="KC">KC</option>
                    <option value="LAA">LAA</option>
                    <option value="MIN">MIN</option>
                    <option value="NYY">NYY</option>
                    <option value="OAK">OAK</option>
                    <option value="SEA">SEA</option>
                    <option value="TB">TB</option>
                    <option value="TEX">TEX</option>
                    <option value="TOR">TOR</option>
                  </select> : player.team}
                </td>
                <td>{currentHitter && currentHitter.runs}</td>
                <td>{currentHitter && currentHitter.hits}</td>
                <td>{currentHitter && currentHitter.homeRuns}</td>
                <td>{currentHitter && currentHitter.rbi}</td>
                <td>{currentHitter && currentHitter.stolenBases}</td>
                <td>{currentHitter && getHitterTotal(currentHitter)}</td>
              </tr>
            )
          })}
          </tbody>
        </PlayerGroupTable>
        <PlayerGroupTable>
          <caption style={{background: '#f4f4f4', color: '#444444', textAlign:'left', textTransform: 'uppercase'}}>starters</caption>
          <tbody>
          {starters.map((player, index) => {
            const currentPitcher = player && currentRawScoreData && currentRawScoreData['pitchers'] && currentRawScoreData['pitchers'][player.playerId] && currentRawScoreData['pitchers'][player.playerId];
            return (
              <tr key={index}>
                <td>
                  {isHiddenOn && <button onClick={(event) => {return onTriggerDeletePlayer(event, player)}}>X</button>}
                </td>
                <td>
                  {isHiddenOn && player.mlbid}
                </td>
                <td  style={{color: 'darkblue', whiteSpace: 'nowrap'}}>
                  {player.name}
                </td>
                <td>
                {isHiddenOn ? <select
                    onChange={(event) => onUpdatePlayerPos(event, player)}
                    className="select-pos pick-property-edit"
                    value={player.pos}
                    data-property="pos"
                  >
                    <option value>-</option>
                    <option value="C">C</option>
                    <option value="1B">1B</option>
                    <option value="2B">2B</option>
                    <option value="3B">3B</option>
                    <option value="SS">SS</option>
                    <option value="LF">LF</option>
                    <option value="CF">CF</option>
                    <option value="RF">RF</option>
                    <option value="DH">DH</option>
                    <option value="SP">SP</option>
                    <option value="RP">RP</option>
                  </select> : player.pos}
                </td>
                <td>
                {isHiddenOn ? <select
                    className="select-team pick-property-edit"
                    onChange={(event) => onUpdatePlayerTeam(event, player)}
                    value={player.team}
                    data-property="team"
                  >
                    <option value>--</option>
                    <option value="BAL">BAL</option>
                    <option value="BOS">BOS</option>
                    <option value="CHA">CHA</option>
                    <option value="CLE">CLE</option>
                    <option value="DET">DET</option>
                    <option value="HOU">HOU</option>
                    <option value="KC">KC</option>
                    <option value="LAA">LAA</option>
                    <option value="MIN">MIN</option>
                    <option value="NYY">NYY</option>
                    <option value="OAK">OAK</option>
                    <option value="SEA">SEA</option>
                    <option value="TB">TB</option>
                    <option value="TEX">TEX</option>
                    <option value="TOR">TOR</option>
                  </select> : player.team}
                </td>
                <td>{currentRawScoreData && currentRawScoreData['starters'] && currentRawScoreData['starters'][player.playerId] && currentRawScoreData['starters'][player.playerId].wins}</td>
                <td>{currentRawScoreData && currentRawScoreData['starters'] && currentRawScoreData['starters'][player.playerId] && currentRawScoreData['starters'][player.playerId].losses}</td>
                <td>{currentRawScoreData && currentRawScoreData['starters'] && currentRawScoreData['starters'][player.playerId] && currentRawScoreData['starters'][player.playerId].inningsPitched}</td>
                <td>{currentRawScoreData && currentRawScoreData['starters'] && currentRawScoreData['starters'][player.playerId] && currentRawScoreData['starters'][player.playerId].strikeOuts}</td>
                <td></td>

              </tr>
            )
          })}
          </tbody>
        </PlayerGroupTable>
        <PlayerGroupTable>
          <caption style={{background: '#f4f4f4', color: '#444444', textAlign:'left', textTransform: 'uppercase'}}>closers</caption>
          <tbody>
          {closers.map((player, index) => {
            const currentPitcher = player && currentRawScoreData && currentRawScoreData['pitchers'] && currentRawScoreData['pitchers'][player.playerId] && currentRawScoreData['pitchers'][player.playerId];
            return (
              <tr key={index}>
                <td>
                {isHiddenOn && <button onClick={(event) => {return onTriggerDeletePlayer(event, player)}}>X</button>}
                </td>
                <td>
                  {isHiddenOn && player.mlbid}
                </td>
                <td style={{color: 'darkblue', whiteSpace: 'nowrap'}}>
                  {player.name}
                </td>
                <td>
                  {isHiddenOn ? <select
                    onChange={(event) => onUpdatePlayerPos(event, player)}
                    className="select-pos pick-property-edit"
                    value={player.pos}
                    data-property="pos"
                  >
                    <option value>-</option>
                    <option value="C">C</option>
                    <option value="1B">1B</option>
                    <option value="2B">2B</option>
                    <option value="3B">3B</option>
                    <option value="SS">SS</option>
                    <option value="LF">LF</option>
                    <option value="CF">CF</option>
                    <option value="RF">RF</option>
                    <option value="DH">DH</option>
                    <option value="SP">SP</option>
                    <option value="RP">RP</option>
                  </select> : player.pos}
                </td>
                <td>
                  {isHiddenOn ? <select
                    className="select-team pick-property-edit"
                    onChange={(event) => onUpdatePlayerTeam(event, player)}
                    value={player.team}
                    data-property="team"
                  >
                    <option value>--</option>
                    <option value="BAL">BAL</option>
                    <option value="BOS">BOS</option>
                    <option value="CHA">CHA</option>
                    <option value="CLE">CLE</option>
                    <option value="DET">DET</option>
                    <option value="HOU">HOU</option>
                    <option value="KC">KC</option>
                    <option value="LAA">LAA</option>
                    <option value="MIN">MIN</option>
                    <option value="NYY">NYY</option>
                    <option value="OAK">OAK</option>
                    <option value="SEA">SEA</option>
                    <option value="TB">TB</option>
                    <option value="TEX">TEX</option>
                    <option value="TOR">TOR</option>
                  </select> : player.team}
                </td>
                <td>{currentRawScoreData && currentRawScoreData['relievers'] && currentRawScoreData['relievers'][player.playerId] && currentRawScoreData['relievers'][player.playerId].wins}</td>
                <td>{currentRawScoreData && currentRawScoreData['relievers'] && currentRawScoreData['relievers'][player.playerId] && currentRawScoreData['relievers'][player.playerId].losses}</td>
                <td>{currentRawScoreData && currentRawScoreData['relievers'] && currentRawScoreData['relievers'][player.playerId] && currentRawScoreData['relievers'][player.playerId].saves}</td>
                <td>{currentRawScoreData && currentRawScoreData['relievers'] && currentRawScoreData['relievers'][player.playerId] && currentRawScoreData['relievers'][player.playerId].inningsPitched}</td>
                <td>{currentRawScoreData && currentRawScoreData['relievers'] && currentRawScoreData['relievers'][player.playerId] && currentRawScoreData['relievers'][player.playerId].strikeOuts}</td>

              </tr>
            )
          })}
          </tbody>
        </PlayerGroupTable>`
      </div>}
      {/* Player form */}
      <div>
      {isHiddenOn && <div style={{display: 'none'}}>
          <div>
            <label>
              Name:
              <input
                value={(targetNewPlayer && targetNewPlayer.name) ? targetNewPlayer.name : ''}
                onChange={(event) => onUpdateNewPlayerProperty(event, 'name')}
              />
            </label>
          </div>
          <div>
            <label>
              Pos:
              <select
                onChange={(event) => onUpdateNewPlayerProperty(event, 'pos')}
                className="select-pos pick-property-edit"
                value={(targetNewPlayer && targetNewPlayer.pos) ? targetNewPlayer.pos : ''}
                data-property="pos"
              >
                <option value>-</option>
                <option value="C">C</option>
                <option value="1B">1B</option>
                <option value="2B">2B</option>
                <option value="3B">3B</option>
                <option value="SS">SS</option>
                <option value="LF">LF</option>
                <option value="CF">CF</option>
                <option value="RF">RF</option>
                <option value="DH">DH</option>
                <option value="SP">SP</option>
                <option value="RP">RP</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Team:
              <select
                className="select-team pick-property-edit"
                onChange={(event) => onUpdateNewPlayerProperty(event, 'team')}
                value={(targetNewPlayer && targetNewPlayer.team) ? targetNewPlayer.team : ''}
                data-property="team"
              >
                <option value>--</option>
                <option value="BAL">BAL</option>
                <option value="BOS">BOS</option>
                <option value="CHA">CHA</option>
                <option value="CLE">CLE</option>
                <option value="DET">DET</option>
                <option value="HOU">HOU</option>
                <option value="KC">KC</option>
                <option value="LAA">LAA</option>
                <option value="MIN">MIN</option>
                <option value="NYY">NYY</option>
                <option value="OAK">OAK</option>
                <option value="SEA">SEA</option>
                <option value="TB">TB</option>
                <option value="TEX">TEX</option>
                <option value="TOR">TOR</option>
              </select>
            </label>
          </div>
          {/* <div>
            <label>
              Status:
              <select
                value={this.state.newPlayer.status}
                onChange={this.updateNewPlayerProperty}
                data-property="draftStatus"
              >
                <option value="drafted">drafted</option>
                <option value="bubble">bubble</option>
                <option value="prospect">prospect</option>
                <option value="protected">protected</option>
                <option value="roster">roster</option>
                <option value="regular">regular</option>
                <option value="unprotected">unprotected</option>
              </select>
            </label>
          </div> */}
          <div className="layout">
            <button
              onClick={onCreatePlayer}
            >
              save
            </button>
          </div>
        </div>}
      </div>
    </RosterManagerContainer>
  );

};