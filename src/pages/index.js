import React, { useEffect, useState } from 'react';
import { CONSTANTS } from '../constants';

import { RosterManager } from '../components/RosterManager';
import { AddPlayerForm } from '../components/AddPlayerForm';
import { PlayerMapper } from '../components/PlayerMapper';
import { PageHeader } from '../components/PageHeader';
import { Layout } from '../components/Layout';

// import rosters2024 from '../data/rosters2024.json';
import rosters2025 from '../data/rosters2025.json';
import { saveRosters } from '../data/saveRosters';

import { StarterPosContainer } from '../components/StarterPosContainer';
import { ClosersPosContainer } from '../components/CloserPosContainer';
import { HitterPosContainer } from '../components/HitterPosContainer';

import { usePoolContext } from '../data/PoolContextProvider';


import {
  getPositionScoreData,
  getRawPosTypeScoreData,
  getRosterTotals,
} from '../components/roster_helpers';

import styled from 'styled-components';

const CONST = {
  IS_ADMIN_MODE: false,
};


const Flex = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
`;
const PageTitle = styled.h1`
  padding: 0;
  margin: 0;
  font-size: 18px;
  font-weight: 200;

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
const RosterTitle = styled.h2`
  font-size: 16px;
  color: #6d0000;
  background-color: #eeeeee;
  text-transform: capitalize;

`;

const posList = [
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'OF',
  'SP',
  'RP'
];
const hitterPosList = [
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'OF',
];
/* 
@media (min-width: 768px) { 
    padding: 1rem 2rem;
    width: 11rem;
  }
*/

export const getPosValue = (pos) => {

  switch(pos) {

    case 'C':
      return 1;
    case '1B':
      return 2;
    case '2B':
      return 3;
    case '3B':
      return 4;
    case 'SS':
      return 5;
    case 'LF':
      return 6;
    case 'CF':
      return 7;
    case 'RF':
      return 8;
    case 'SP':
      return 10;
    case 'RP':
      return 11;
    default:
      return 0;
  }
};

export const sortRosterPlayers = (players) => {

  const sort = players.sort(function(a, b) {
    return getPosValue(a.pos) - getPosValue(b.pos);
  });

  return sort;
};

/*
  var battersUrl = "http://mlb.mlb.com/pubajax/wf/flow/stats.splayer?season=2019&sort_order=%27desc%27&sort_column=%27g%27&stat_type=hitting&page_type=SortablePlayer&game_type=%27R%27&player_pool=QUALIFIER&season_type=ANY&league_code=%27AL%27&sport_code=%27mlb%27&results=1000&recSP=1&recPP=999";
  var pitchersUrl = "http://mlb.mlb.com/pubajax/wf/flow/stats.splayer?season=2019&sort_order=%27desc%27&sort_column=%27sv%27&stat_type=pitching&page_type=SortablePlayer&game_type=%27R%27&player_pool=QUALIFIER&season_type=ANY&league_code=%27AL%27&sport_code=%27mlb%27&results=1000&position=%271%27&recSP=1&recPP=999";
  var nlPitchersUrl = "http://mlb.mlb.com/pubajax/wf/flow/stats.splayer?season=2019&sort_order=%27desc%27&sort_column=%27sv%27&stat_type=pitching&page_type=SortablePlayer&game_type=%27R%27&player_pool=QUALIFIER&season_type=ANY&league_code=%27NL%27&sport_code=%27mlb%27&results=1000&position=%271%27&recSP=1&recPP=999";
  var nlBattersUrl = "http://mlb.mlb.com/pubajax/wf/flow/stats.splayer?season=2019&sort_order=%27desc%27&sort_column=%27g%27&stat_type=hitting&page_type=SortablePlayer&game_type=%27R%27&player_pool=QUALIFIER&season_type=ANY&league_code=%27NL%27&sport_code=%27mlb%27&results=1000&recSP=1&recPP=999";




*/
// const battersUrl = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2021&stats=season&group=hitting&gameType=R&limit=1000&offset=0&sortStat=onBasePlusSlugging&order=desc&playerPool=ALL_CURRENT&leagueIds=103";

const battersUrl = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2025&sportId=1&stats=season&group=hitting&gameType=R&limit=300&offset=0&sortStat=onBasePlusSlugging&order=desc";

const pitchersUrl = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2025&stats=season&group=pitching&gameType=R&limit=1000&offset=0&sortStat=earnedRunAverage&order=asc&playerPool=ALL_CURRENT&leagueIds=103";








function HomePage() {
  const [rosterData, setRosterData] = useState({});
  const [isHiddenOn, setIsHiddenOn] = useState(CONST.IS_ADMIN_MODE);  // toggle this for admin
  const [rosterTotals, setRosterTotals] = useState([]);
  const { state, dispatch } = usePoolContext();

  useEffect(() => {
    let rosterBlob = rosters2025;
    Object.keys(rosterBlob).map((rosterKey) => {
      rosterBlob[rosterKey].players.map((player) => {
        if (!player.roster) {
          player.roster = rosterKey;
        }
      })
    });


    let preExistingHitterStats;
    try {
      preExistingHitterStats = window.localStorage.getItem(CONSTANTS.RAW_HITTER_STATS);
    }
     catch(error) {
       console.error('|  can not fetch RAW_HITTER_STATS', JSON.stringify(error) );
     }
    if (preExistingHitterStats) {
      dispatch({type: 'setMlbHitters', mlbHitters: JSON.parse(preExistingHitterStats)});
      //setMlbHitters(JSON.parse(preExistingHitterStats));
    }

    let preExistingPitcherStats;
    try {
      preExistingPitcherStats = window.localStorage.getItem(CONSTANTS.RAW_PITCHER_STATS);
    }
     catch(error) {
       console.error('|  can not fetch RAW_PITCHER_STATS', JSON.stringify(error) );
     }
    if (preExistingPitcherStats) {
      dispatch({type: 'setMlbHitters', mlbHitters: JSON.parse(preExistingHitterStats)});
     // setMlbPitchers(JSON.parse(preExistingPitcherStats));
    }
    // console.log(JSON.stringify(rosterBlob));
    setRosterData(rosterBlob);
  }, []);


  useEffect(() => {

    const rosterTotals = {};
    rosterData && Object.keys(rosterData).map((rosterKey) => {
      const currentRoster = rosterData[rosterKey];
      rosterTotals[rosterKey] = {
        'SP': 0,
        'RP': 0,
        'OF': 0,
        'C': 0,
        '1B': 0,
        '2B': 0,
        '3B': 0,
        'SS': 0,
        'hitters': 0,
        'starters': 0,
        'relievers': 0,
        'grandTotal': 0,
        'roster': rosterKey
      };

      posList.map((position) => {
 
        if (currentRoster && currentRoster.players) {
    
          // total it up
          // clean up outfield positions
          const positionCollection = currentRoster ? currentRoster.players.filter((rosterPlayer) => {
            if (position === 'OF' && (rosterPlayer.pos === 'LF' || rosterPlayer.pos === 'CF' || rosterPlayer.pos === 'RF' || rosterPlayer.pos === 'OF')) {
              rosterPlayer.pos = 'OF';
              return rosterPlayer;
            }
            return rosterPlayer.pos === position;
          }) : [];
      
          // sort the collection
          const sortedCollection = positionCollection.sort((a, b) => {
            var x = a.total;
            var y = b.total;
            return x > y ? -1 : x < y ? 1 : 0;
          });
          let tally = 0;
      
          if (sortedCollection.length > 0) {
            /*
            TALLY STARTERS
            */
            if (position === 'SP') {
              // tally up starters
              tally = 0 ;
              let calculationCollection = [].concat(sortedCollection);
              if (calculationCollection.length > 4) {
                calculationCollection = sortedCollection.filter((item, index) => {return index < 4});
              }
              calculationCollection.map((player) => {
                tally = tally + player.total;

              });
              rosterTotals[rosterKey]['SP'] = tally;
              rosterTotals[rosterKey]['starters'] = tally;
            }
            /*
            TALLY CLOSERS
            */
            else if (position === 'RP') {
              // tally up closers
              tally = 0 ;
              let calculationCollection = [].concat(sortedCollection);
              if (sortedCollection.length > 2) {
                calculationCollection = sortedCollection.filter((item, index) => {return index < 2});
              }
              calculationCollection.map((player) => {
                tally = tally + player.total;
              });
              rosterTotals[rosterKey]['RP'] = tally;
              rosterTotals[rosterKey]['relievers'] = tally;
            }
            /*
            TALLY OUTFIELD
            */
            else if (position === 'OF') {
              // tally up outfielders
              tally = 0 ;
              let calculationCollection = [].concat(sortedCollection);
              if (sortedCollection.length > 4) {
                calculationCollection = sortedCollection.filter((item, index) => {return index < 4});
              }
              calculationCollection.map((player) => {
                tally = tally + player.total;
              });
              rosterTotals[rosterKey]['OF'] = tally;
            }

            /*
            TALLY EACH POSITION
            */
            else {
              // tally up regular hitter
              tally = 0 ;
              tally = sortedCollection[0].total;
              rosterTotals[rosterKey][position] = tally;      
              switch(position) {
                case 'C': {
          //       setRosterCatcherTotal(tally);
                  break;
                }
                case '1B': {
          //        setRoster1BTotal(tally);
                  break;
                }
                case '2B': {
          //        setRoster2BTotal(tally);
                  break;
                }
                case '3B': {
          //       setRoster3BTotal(tally);
                  break;
                }
                case 'SS': {
          //       setRosterSSTotal(tally);
                  break;
                }

                default: {}
              }
            }
        
          }

        // setRosterHittersTotal(runningHitterTotal);   
        }    
    
       });

       rosterTotals[rosterKey]['hitters'] =  Number(rosterTotals[rosterKey]['OF']) + 
        Number(rosterTotals[rosterKey]['C']) + 
        Number(rosterTotals[rosterKey]['1B']) + 
        Number(rosterTotals[rosterKey]['2B']) + 
        Number(rosterTotals[rosterKey]['3B']) + 
        Number(rosterTotals[rosterKey]['SS']); 

        if (rosterTotals[rosterKey]['hitters'] && rosterTotals[rosterKey]['starters'] && rosterTotals[rosterKey]['relievers']) {
          const theTotal = rosterTotals[rosterKey]['hitters'] + rosterTotals[rosterKey]['starters'] + rosterTotals[rosterKey]['relievers'];    
          rosterTotals[rosterKey]['grandTotal'] = theTotal;
        }
    });

    if (rosterTotals['bashers']) {  // pick any one just to make sure we have data
      let grandTotalsHistoryData;
      try {
        grandTotalsHistoryData = window.localStorage.getItem(CONSTANTS.GRAND_TOTALS_HISTORY);
      }
       catch(error) {
         console.error('|  can not fetch GRAND_TOTALS_HISTORY', JSON.stringify(error) );
       }
      let theHistoryData = {};
  
      if (!grandTotalsHistoryData) {
        const timestamp = new Date().getTime();
        grandTotalsHistoryData = {};
        rosterTotals.timestamp = timestamp;
        grandTotalsHistoryData[timestamp] = rosterTotals;
        theHistoryData = grandTotalsHistoryData;

        try {
          window.localStorage.setItem(CONSTANTS.GRAND_TOTALS_HISTORY, JSON.stringify(theHistoryData));
        }
         catch(error) {
           console.error('|  can not write GRAND_TOTALS_HISTORY', JSON.stringify(error) );
         }
      }
      else {
        theHistoryData = JSON.parse(grandTotalsHistoryData);

        let historyCollection = []
        Object.keys(theHistoryData).map((historyKey) => {
          const currentDataObject = theHistoryData[historyKey];
          historyCollection.push(currentDataObject);
        });
    

        let isNewHistory = false;
        if (historyCollection.length > 1) {
          historyCollection.sort((a, b) => {
            var x = a.timestamp;
            var y = b.timestamp;
            return x > y ? -1 : x < y ? 1 : 0;
          });

          const currentHistoryObj = rosterTotals;
          const previousHistoryObj = historyCollection[0];
          if ((rosterTotals['stallions']['grandTotal'] !== previousHistoryObj['stallions']['grandTotal']) ||
          (rosterTotals['mashers']['grandTotal'] !== previousHistoryObj['mashers']['grandTotal']) ||
          (rosterTotals['bashers']['grandTotal'] !== previousHistoryObj['bashers']['grandTotal']) ||
          (rosterTotals['rallycaps']['grandTotal'] !== previousHistoryObj['rallycaps']['grandTotal'])) {
           // console.log('|  this is new history ');
             isNewHistory = true;
          }
          else {
          //  console.log('|  this is not new history ');  
          }
        }
        else {
          isNewHistory = true;
        }

        if (isNewHistory) {
          // create a new history object
          const newTimestamp = new Date().getTime();

          rosterTotals.timestamp = newTimestamp;
          theHistoryData[newTimestamp] = rosterTotals;
          dispatch({type: 'setLastUpdateTimestamp', timestamp: newTimestamp});

          try {
            window.localStorage.setItem(CONSTANTS.GRAND_TOTALS_HISTORY, JSON.stringify(theHistoryData));
          }
           catch(error) {
             console.error('|  can not write GRAND_TOTALS_HISTORY', JSON.stringify(error) );
           }
        }
        let deltaMasterHistoryData;
        try {
          deltaMasterHistoryData = window.localStorage.getItem(CONSTANTS.GRAND_TOTALS_HISTORY);
        }
         catch(error) {
           console.error('|  can not fetch GRAND_TOTALS_HISTORY', JSON.stringify(error) );
         }
        let parsedDeltaMasterHistoryData = deltaMasterHistoryData && JSON.parse(deltaMasterHistoryData);

        let deltaHistoryCollection = [];
        Object.keys(parsedDeltaMasterHistoryData).map((historyKey) => {
          const currentDataObject = theHistoryData[historyKey];
          deltaHistoryCollection.push(currentDataObject);
        });

        if (deltaHistoryCollection.length > 1) {
          deltaHistoryCollection.sort((a, b) => {
            var x = a.timestamp;
            var y = b.timestamp;
            return x > y ? -1 : x < y ? 1 : 0;
          });

          const newer = deltaHistoryCollection[0];
          const older = deltaHistoryCollection[1];

          dispatch({type: 'setLastUpdateTimestamp', timestamp: newer.timestamp});

          rosterTotals['bashers']['delta'] = (Number(newer['bashers']['grandTotal']) - Number(older['bashers']['grandTotal']));
          rosterTotals['mashers']['delta'] = (Number(newer['mashers']['grandTotal']) - Number(older['mashers']['grandTotal']));
          rosterTotals['rallycaps']['delta'] = (Number(newer['rallycaps']['grandTotal']) - Number(older['rallycaps']['grandTotal']));
          rosterTotals['stallions']['delta'] = (Number(newer['stallions']['grandTotal']) - Number(older['stallions']['grandTotal']));
        }  
      }
    }
    dispatch({type: 'setGrandTotals', rosterTotals});
    setRosterTotals(rosterTotals);
  }, []);


  const getNickName = (name) => {
    if (!name) {
      return;
    }
    let newName = name.trim();
    newName = newName.replaceAll(' ', '_');
    return newName.toLowerCase(); 
  };


  // give players a unique name that hopefully will bypass some of the 
  // dependencies on mlb.playerid
  const addNickName = () => {
    // get the rosters, iterate over the names and if they don't have a nick name then create one
    //  convert upper case to lower and add underscore link
    const clonedRosterData = {...rosterData};

    const a = clonedRosterData;
    Object.keys(clonedRosterData).map((rosterKey) => {
      clonedRosterData[rosterKey].players.map((player) => {
        if (!player.nickname) {
          player.nickname = getNickName(player.name);
          return player;
        }
        else {
          return player;
        }
      });
    });
    saveRosters(clonedRosterData);  
  };


  // each new year we have to clear the total property for each player so it doesn't
  // show up next season with last year total before they get new stats to overwrite
  const zeroYearTotals = () => {
    const clonedRosterData = {...rosterData};

    const a = clonedRosterData;
    Object.keys(clonedRosterData).map((rosterKey) => {
      clonedRosterData[rosterKey].players = clonedRosterData[rosterKey].players.map((player) => {
        player.total = 0;
        return player;
      });
    });
    // should only need to do this at the beginning of the year
    // saveRosters(clonedRosterData); 
  };

  // each new year we have to clear the total property for each player so it doesn't
  // show up next season with last year total before they get new stats to overwrite
  const mlbPlayerLink = () => {
    const clonedRosterData = {...rosterData};

    const a = clonedRosterData;
    Object.keys(clonedRosterData).map((rosterKey) => {
      clonedRosterData[rosterKey].players = clonedRosterData[rosterKey].players.map((player) => {
        let playerLinkId = `${player.nickname.replaceAll('_', '-').toLowerCase()}-${player.playerId}`;
        player.newsLink = `https://www.mlb.com/player/${playerLinkId}`;
        return player;
      });
    });
    saveRosters(clonedRosterData); 
  };

  const onHiddenControlClick = (event) => {
    setIsHiddenOn(!isHiddenOn);
  };

  const onUpdateRosterTotal = (roster, total) => {
    if (rosterData && total > 0) {
      const copyRosterData = {...rosterData};

      const currentRoster = copyRosterData[roster];

      if (currentRoster.total !== total) {
        copyRosterData[roster].total = total;
        setRosterData(copyRosterData);
      }
    }

  };

  // const onUpdateRosterPlayer = (player) => {
  //   if (player && player.roster) {
  //     rosterData[player.roster].players.map((rosterPlayer) => {
  //       if (rosterPlayer.name = player.name) {
  //         rosterPlayer = player;
  //       }
  //       return rosterPlayer;

  //     });
  //   }
  // };

  const onSaveRosters = (targetRoster) => {
    const clonedRosterData = {...rosterData};
    if (targetRoster.slug) {
      clonedRosterData[targetRoster.slug] = targetRoster;
    }
    //clonedRosterData
    setRosterData(clonedRosterData);
    saveRosters(clonedRosterData);
    
    try {
      window.localStorage.setItem(CONSTANTS.ROSTER_DATA_NAME, JSON.stringify(clonedRosterData));
    }
     catch(error) {
       console.error('|  can not write ROSTER_DATA_NAME', JSON.stringify(error) );
     }
  };

  const onSavePlayer = (player) => {


    if (player && player.roster) {
      if (!player.total) {
        player.total = 0;

      }
      const clonedRosterData = {...rosterData};
console.log(`| SAVE player  ${JSON.stringify(player)}  `);
      const targetRoster = clonedRosterData[player.roster];

      const existingPlayerFilter = targetRoster.players.filter((rosterPlayer) => {
        return rosterPlayer.name === player.name;
      });

      if (existingPlayerFilter.length === 0) {
       // console.log(`|  ADD PLAYER AND SAVE`);
        targetRoster.players.push(player);
        clonedRosterData[player.roster] = targetRoster;
        setRosterData(clonedRosterData);

        try {
          window.localStorage.setItem(CONSTANTS.ROSTER_DATA_NAME, JSON.stringify(clonedRosterData)); 
        }
         catch(error) {
           console.error('|  can not write ROSTER_DATA_NAME', JSON.stringify(error) );
         }
      }
      else {
        clonedRosterData[player.roster].players.map((rosterPlayer) => {
          if (rosterPlayer.name === player.name) {
            rosterPlayer = player;
          }  
        });
        setRosterData(clonedRosterData);
         
        try {
          window.localStorage.setItem(CONSTANTS.ROSTER_DATA_NAME, JSON.stringify(clonedRosterData)); 
        }
         catch(error) {
           console.error('|  can not write ROSTER_DATA_NAME', JSON.stringify(error) );
         }
      }
      saveRosters(clonedRosterData);    


    }
    else {
      console.warn(`| tried to save a player with no roster ${JSON.stringify(player)}`);
    }

  };

let currentSortedRosters = [];

let rosterDisplayCollection = [];
if (rosterData) {
  // let rosterDisplayCollection = [];
  Object.keys(rosterData).map((rosterKey) => {
    const currentRoster = rosterData[rosterKey];
    rosterDisplayCollection.push({
      roster: rosterKey,
      total: currentRoster.total,
    });

  });
}
if (rosterDisplayCollection && rosterDisplayCollection.length > 0) {
  rosterDisplayCollection = rosterDisplayCollection.sort((a, b) => {
    if (a.total < b.total) {
      return -1
    }
  
    if (a.total - b.total) {
      return 1
    }
  
    return 0
  });
}


          // rosterData && Object.keys(rosterData).map((rosterKey, index) => {
          //   const currentRoster = rosterData[rosterKey];
          //   currentRoster.players = sortRosterPlayers(currentRoster.players);
          //   return (
          //     <RosterManager key={index} onUpdateRosterTotal={onUpdateRosterTotal} mlbPitchers={state?.mlbPitchers?.stats} mlbHitters={state?.mlbHitters?.stats} roster={currentRoster} saveRosters={onSaveRosters} isHiddenOn={isHiddenOn} />     
          //   );
          // })
  // const helloSean = 'hello sean';
  // console.log(rosterData);
  const mlbPitchers= state?.mlbPitchers?.stats;
  const mlbHitters = state?.mlbHitters?.stats;

  let sortedLeaderboardCollection = [];
  let finalCollection = [];

  const displayRosterCollectorObject = {};

  Object.keys(rosterData).map((rosterKey) => {
    const roster = rosterData[rosterKey];
    if (roster && roster.players) {






      let rawPosTypeScoreData = getRawPosTypeScoreData(roster, mlbHitters, mlbPitchers);
      
      
      let positionScoreData = getPositionScoreData(roster, mlbHitters, mlbPitchers);
      // setCurrentRosterScoreData
      // blob data
      // hittersBlob={currentRosterScoreData}


      const positionTotals = getRosterTotals(roster);

      const relieverTotals = positionTotals['RP'];
      if (relieverTotals > 0) {
        const dataEntry = {};
        dataEntry.roster = roster.slug;


        const rosterOutfieldTotal = positionTotals['OF'];
        const rosterCatcherTotal = positionTotals['C'];
        const roster1BTotal = positionTotals['1B'];
        const roster2BTotal = positionTotals['2B'];
        const roster3BTotal = positionTotals['3B'];
        const rosterSSTotal = positionTotals['SS'];
        const rosterStartersTotal = positionTotals['SP'];
        const rosterClosersTotal = positionTotals['RP'];

        const runningHitterTotal =  Number(rosterOutfieldTotal) + Number(rosterCatcherTotal) + Number(roster1BTotal) + Number(roster2BTotal) + Number(roster3BTotal) + Number(rosterSSTotal);
        
        const theTotal = runningHitterTotal + rosterStartersTotal + rosterClosersTotal;
        
        if (!displayRosterCollectorObject[roster.slug]) {
          displayRosterCollectorObject[roster.slug] = {
            roster: roster.slug,
            total: theTotal,
          };
        }

        dataEntry.total = theTotal;
        dataEntry.positionScoreData = positionScoreData;
        dataEntry.hitterTotals = runningHitterTotal;
        dataEntry.starterTotals = rosterStartersTotal;
        dataEntry.closersTotal = rosterClosersTotal;
        finalCollection.push(dataEntry);
      }

      

    } 
  });
  if (finalCollection && finalCollection.length > 0) {
    // const collection = Object.values(displayRosterCollectorObject);
    let sortedArray = finalCollection.sort((a, b) => {
      return b.total - a.total;
    });
    sortedLeaderboardCollection = sortedArray;
  }
  

return (<Layout>

    {isHiddenOn && <PlayerMapper rosterData={rosterData} savePlayer={onSavePlayer} mlbHitters={state?.mlbHitters?.stats} mlpPitchers={state?.mlpPitchers?.stats} />}
    {isHiddenOn && <AddPlayerForm savePlayer={onSavePlayer} />}
    {isHiddenOn&& <button onClick={addNickName}>process nicknames</button>}
    {isHiddenOn&& <button onClick={zeroYearTotals}>zero totals</button>}
    {isHiddenOn&& <button onClick={mlbPlayerLink}>player links</button>} 

      <Flex>
        {
          sortedLeaderboardCollection.map((boardItem, index) => {
            return (<RosterPosTypeContainer key={index}>
              <RosterTitle>[{index + 1}] {boardItem.roster} :: {boardItem.total}</RosterTitle>              
              {
                hitterPosList.map((pos) => {
                  return <HitterPosContainer key={pos} roster={boardItem.roster}  pos={pos} hittersBlob={boardItem.positionScoreData} />
                })
              }
              <ScoreContainer>
                <ScoreLabel>Hitters:</ScoreLabel><ScoreValue>{parseFloat(boardItem.hitterTotals).toFixed(2)}</ScoreValue>
              </ScoreContainer>
              <StarterPosContainer roster={boardItem.roster} startersBlob={boardItem.positionScoreData} />
              <ScoreContainer>
                <ScoreLabel>Starters:</ScoreLabel><ScoreValue>{parseFloat(boardItem.starterTotals).toFixed(2)}</ScoreValue>
              </ScoreContainer>
              <ClosersPosContainer roster={boardItem.roster} pitchersBlob={boardItem.positionScoreData} />
              <ScoreContainer>
                <ScoreLabel>Closers:</ScoreLabel><ScoreValue>{parseFloat(boardItem.closersTotal).toFixed(2)}</ScoreValue>
              </ScoreContainer>
              <ScoreContainer>
                <ScoreLabel>Grand Total:</ScoreLabel><ScoreValue>{boardItem.total}</ScoreValue>
              </ScoreContainer>              
            </RosterPosTypeContainer>);
          })
        }
      </Flex>

      <Flex>
        {
          isHiddenOn && rosterData && Object.values(rosterData).map((roster, index) => {
            roster.players = sortRosterPlayers(roster.players);
            return (
              <RosterManager key={index} onUpdateRosterTotal={onUpdateRosterTotal} mlbPitchers={state?.mlbPitchers?.stats} mlbHitters={state?.mlbHitters?.stats} roster={roster} saveRosters={onSaveRosters} isHiddenOn={isHiddenOn} />     
            );         
          })
        }
      </Flex>
      <div style={{margin: '6px 0 0 0'}}>
        <a href="https://www.mlb.com/probable-pitchers" target="_blank">Probable pitchers</a>
      </div>
      <div style={{margin: '6px 0 0 0'}}>
        <a href="https://www.nbcsportsedge.com/baseball/mlb/player-news?team=1" target="_blank">Player news</a>
      </div>
      <div style={{margin: '6px 0 0 0'}}>
        <a href="https://sports.yahoo.com/mlb/scoreboard/" target="_blank">Scores</a>
      </div>
      <div>
        <h3>Trade - March 27, 2025</h3>
        <div>
          <p>To Mashers:</p>
          <ul>
          <li>SP T Bibee Cle</li>
          <li>SP B Miller  Sea</li>
          <li>C L O Hoppe LAA</li>
          <li>2B/1B C Keith. Det</li>
          <li>SS Z Neto. LAA</li>
          </ul>
          <p>To Stallions:</p>
          <ul>
          <li>SP L Gilbert Sea</li>
          <li>2nd Rd pick</li>
          <li>4th Rd pick</li>
          <li>7th Rd pick</li>
          <li>Prospect M Mayer SS Bos</li>
          </ul>
        </div>
      </div>

      
      {isHiddenOn && <textarea rows="12" cols="90" alue={JSON.stringify(rosterData)} />}
  </Layout>);
}

export default HomePage