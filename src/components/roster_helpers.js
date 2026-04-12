import { CONSTANTS } from '../constants';

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

export const getPosTally = (collection, pos) => {
  tally = 0 ;
  let calculationCollection = [].concat(sortedCollection);
  if (sortedCollection.length > 2) {
    calculationCollection = sortedCollection.filter((item, index) => {return index < 2});
  }
  calculationCollection.map((player) => {
    tally = tally + player.total;
  });
  return tally;
};

export const getRosterTotals = (currentRoster) => {
  const rostPosTotals = {};


  posList.map((position) => {

    if (currentRoster && currentRoster.players) {

      // total it up
      const positionCollection = currentRoster ? currentRoster.players.filter((rosterPlayer) => {
        if (position === 'OF' && (rosterPlayer.pos === 'LF' || rosterPlayer.pos === 'CF' || rosterPlayer.pos === 'RF' || rosterPlayer.pos === 'OF')) {
          rosterPlayer.pos = 'OF';
          return rosterPlayer;
        }
        return rosterPlayer.pos === position;
      }) : [];

      const sortedCollection = positionCollection.sort((a, b) => {
        var x = a.total;
        var y = b.total;
        return x > y ? -1 : x < y ? 1 : 0;
      });
      let tally = 0;

      if (sortedCollection.length > 0) {
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
          rostPosTotals['SP'] = tally;
          //setRosterStartersTotal(tally);


        }
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
          rostPosTotals['RP'] = tally;
        }
        else if (position === 'OF') {
          // tally up outfielders
          tally = 0 ;
          let calculationCollection = [].concat(sortedCollection);
          if (sortedCollection.length > 4) {
            calculationCollection = sortedCollection.filter((item, index) => {
              return index < 4;
            });
          }

          calculationCollection.map((player) => {
            tally = tally + player.total;
          });
          rostPosTotals['OF'] = tally;
        }
        else {
          // tally up regular hitter
          tally = 0 ;
          tally = sortedCollection[0].total;

        
          switch(position) {

            case 'C': {
              rostPosTotals['C'] = tally;
              break;
            }
            case '1B': {
              rostPosTotals['1B'] = tally;


              break;
            }
            case '2B': {
              rostPosTotals['2B'] = tally;


              break;
            }
            case '3B': {
              rostPosTotals['3B'] = tally;


              break;
            }
            case 'SS': {
              rostPosTotals['SS'] = tally;


              break;
            }
            case 'DH': {
              rostPosTotals['DH'] = 0;


              break;
            }
            default: {
              
            }
          }
        }
    
      }

    }


  });
  return rostPosTotals;
};


const randomPlayerId = () => {
  return Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)
};

const getHitterTotal = (hitter) => {
  if (!hitter.playerId) {
    return 0;
  }
  return (hitter.runs) + (hitter.hits / 2) + (hitter.rbi) + (hitter.homeRuns * 2) + (hitter.stolenBases / 2);;
};
const getStarterTotal = (starter) => {
  if (!starter.playerId) {
    return 0;
  }
  const totalVal = ((starter.wins * 15) - (starter.losses * 4) + (starter.strikeOuts / 2));
  return totalVal;
};
const geCloserTotal = (reliever) => {
  const totalVal = (reliever.saves * 7) + (reliever.wins * 6) + (reliever.strikeOuts / 2) + (reliever.inningsPitched / 2);
  return totalVal;
};

export const getRawPosTypeScoreData = (roster, mlbHitters, mlbPitchers) => {
  let rawPosTypeScoreData = {hitters: {}, starters: {}, relievers: {}};

  let preExistingStoredPosData;
  try {
    preExistingStoredPosData = window.localStorage.getItem(CONSTANTS.RAW_POS_STATS);
  }
   catch(error) {
     console.error('|  can not fetch RAW_POS_STATS', JSON.stringify(error) );
   }
  if (preExistingStoredPosData) {
    rawPosTypeScoreData = JSON.parse(preExistingStoredPosData);
  }

  let positionScoreData = {};

  let preExistingRosterStats;
  try {
    preExistingRosterStats = window.localStorage.getItem(CONSTANTS.ROSTER_STATS);
  }
   catch(error) {
     console.error('|  can not fetch ROSTER_STATS', JSON.stringify(error) );
   }
  if (preExistingRosterStats) {
    positionScoreData = JSON.parse(preExistingRosterStats);
  }

  /*
  
  THE BIG LOOP
  
  */
  roster.players.map((player) => {

    /* 
    
    HITTERS

    */
    let hitterStats = null;
    if (player.posType === 'hitter') {
      if (player.playerId) {  // mlb stats are available
        hitterStats = mlbHitters && mlbHitters[player.playerId];
      }
      else {
        hitterStats = {
          runs: 0,
          hits: 0,
          homeRuns: 0,
          rbi: 0,
          sb: 0
        };            
      }
      if (hitterStats) {
        hitterStats.roster = roster.slug;
        hitterStats.poolPos = player.pos;
        rawPosTypeScoreData['hitters'][player.nickname] = hitterStats;


        const currentHitter = player && rawPosTypeScoreData && rawPosTypeScoreData['hitters'] && rawPosTypeScoreData['hitters'][player.nickname];
        
        player.total = currentHitter ? getHitterTotal(currentHitter) : 0;
        rawPosTypeScoreData['hitters'][player.nickname].total = player.total;
        rawPosTypeScoreData['hitters'][player.nickname].newsLink = player.newsLink ? player.newsLink : '';
        // convert LF, CF and RF to OF
        let thePos = player.pos;
        if (player.pos === 'LF' || player.pos === 'CF' || player.pos === 'RF') {
          thePos = 'OF';
        }   

        const mergedHitterData = {...player, ...currentHitter};

        if (!positionScoreData[thePos]) {
          positionScoreData[thePos] = {};
        }

        positionScoreData[thePos][mergedHitterData.nickname] = mergedHitterData;
      }          
    }
    else if (player.pos === 'SP') {
    /* 
    
    STARTERS

    */
      let rawPitcherStats = null;
      if (player.playerId) {
        rawPitcherStats = mlbPitchers && mlbPitchers[player.playerId];

      }
      else {
        rawPitcherStats = {
          wins: 0,
          losses: 0,
          strikeOuts: 0
        };
      }
      if (rawPitcherStats) {
        rawPitcherStats.roster = roster.slug;
        rawPitcherStats.poolPos = player.pos;
        rawPitcherStats.nickname = player.nickname;
        rawPosTypeScoreData['starters'][player.nickname] = rawPitcherStats;

        const currentPitcher = player && rawPosTypeScoreData && rawPosTypeScoreData['starters'] && rawPosTypeScoreData['starters'][player.nickname];

        player.total = currentPitcher ? getStarterTotal(currentPitcher) : 0;
        rawPosTypeScoreData['starters'][player.nickname].total = player.total;
        rawPosTypeScoreData['starters'][player.nickname].newsLink = player.newsLink ? player.newsLink : '';

        const mergedPitcherData = {...player, ...currentPitcher};
        if (!positionScoreData['SP']) {
          positionScoreData['SP'] = {};
        }

        positionScoreData['SP'][mergedPitcherData.nickname] = mergedPitcherData;
      }
      
    }
    else  if (player.pos === 'RP') {
    /* 
    
    CLOSERS

    */
      if (player.nickname) {
        let rawRelieverStats = mlbPitchers && mlbPitchers[player.playerId];
        if (!rawRelieverStats) {
          rawRelieverStats = {
            wins: 0,
            ip: 0,
            saves: 0,
            losses: 0,
            strikeOuts: 0
          };
          const mergedCloserData = {...player, ...rawRelieverStats};
          if (!positionScoreData['RP']) {
            positionScoreData['RP'] = {};
          }

          positionScoreData['RP'][mergedCloserData.nickname] = mergedCloserData;
        }
        else { 
          rawRelieverStats.roster = roster.slug;
          rawRelieverStats.poolPos = player.pos;
          rawPosTypeScoreData['relievers'][player.nickname] = rawRelieverStats;
          const currentCloserPitcher = player && rawPosTypeScoreData && rawPosTypeScoreData['relievers'] && rawPosTypeScoreData['relievers'][player.nickname];
          player.total = currentCloserPitcher ? geCloserTotal(currentCloserPitcher) : 0;
          rawPosTypeScoreData['relievers'][player.nickname].total = player.total;
          rawPosTypeScoreData['relievers'][player.nickname].newsLink = player.newsLink ? player.newsLink : '';

          const mergedCloserData = {...player, ...currentCloserPitcher};
          if (!positionScoreData['RP']) {
            positionScoreData['RP'] = {};
          }

          positionScoreData['RP'][mergedCloserData.nickname] = mergedCloserData;
        }
      }
    }
    else {
      console.warn('| This does not have a clear position', player);
    }
  });





  


  // setCurrentRawScoreData(rawPosTypeScoreData);
  // setCurrentRoster({...roster});


  if (rawPosTypeScoreData) {
    try {
      window.localStorage.setItem(CONSTANTS.RAW_POS_STATS, JSON.stringify(rawPosTypeScoreData)); 
    }
     catch(error) {
       console.error('|  can not write RAW_POS_STATS', JSON.stringify(error) );
     }       

  }

    if (positionScoreData) {
      try {
        window.localStorage.setItem(CONSTANTS.ROSTER_STATS, JSON.stringify(positionScoreData));  
      }
       catch(error) {
         console.error('|  can not write ROSTER_STATS', JSON.stringify(error) );
       }  

    }
    return rawPosTypeScoreData;
};


export const getPositionScoreData = (roster, mlbHitters, mlbPitchers) => {
  let rawPosTypeScoreData = {hitters: {}, starters: {}, relievers: {}};

  let preExistingStoredPosData;
  try {
    preExistingStoredPosData = window.localStorage.getItem(CONSTANTS.RAW_POS_STATS);
  }
   catch(error) {
     console.error('|  can not fetch RAW_POS_STATS', JSON.stringify(error) );
   }
  if (preExistingStoredPosData) {
    rawPosTypeScoreData = JSON.parse(preExistingStoredPosData);
  }

  let positionScoreData = {};

  let preExistingRosterStats;
  try {
    preExistingRosterStats = window.localStorage.getItem(CONSTANTS.ROSTER_STATS);
  }
   catch(error) {
     console.error('|  can not fetch ROSTER_STATS', JSON.stringify(error) );
   }
  if (preExistingRosterStats) {
    positionScoreData = JSON.parse(preExistingRosterStats);
  }

  /*
  
  THE BIG LOOP
  
  */
  roster.players.map((player) => {

    /* 
    
    HITTERS

    */
    let hitterStats = null;
    if (player.posType === 'hitter') {
      if (player.playerId) {  // mlb stats are available
        hitterStats = mlbHitters && mlbHitters[player.playerId];
      }
      else {
        hitterStats = {
          runs: 0,
          hits: 0,
          homeRuns: 0,
          rbi: 0,
          sb: 0
        };            
      }
      if (hitterStats) {
        hitterStats.roster = roster.slug;
        hitterStats.poolPos = player.pos;
        rawPosTypeScoreData['hitters'][player.nickname] = hitterStats;


        const currentHitter = player && rawPosTypeScoreData && rawPosTypeScoreData['hitters'] && rawPosTypeScoreData['hitters'][player.nickname];
        
        player.total = currentHitter ? getHitterTotal(currentHitter) : 0;
        rawPosTypeScoreData['hitters'][player.nickname].total = player.total;
        rawPosTypeScoreData['hitters'][player.nickname].newsLink = player.newsLink ? player.newsLink : '';
        // convert LF, CF and RF to OF
        let thePos = player.pos;
        if (player.pos === 'LF' || player.pos === 'CF' || player.pos === 'RF') {
          thePos = 'OF';
        }   

        const mergedHitterData = {...player, ...currentHitter};

        if (!positionScoreData[thePos]) {
          positionScoreData[thePos] = {};
        }

        positionScoreData[thePos][mergedHitterData.nickname] = mergedHitterData;
      }          
    }
    else if (player.pos === 'SP') {
    /* 
    
    STARTERS

    */
      let rawPitcherStats = null;
      if (player.playerId) {
        rawPitcherStats = mlbPitchers && mlbPitchers[player.playerId];

      }
      else {
        rawPitcherStats = {
          wins: 0,
          losses: 0,
          strikeOuts: 0
        };
      }
      if (rawPitcherStats) {
        rawPitcherStats.roster = roster.slug;
        rawPitcherStats.poolPos = player.pos;
        rawPitcherStats.nickname = player.nickname;
        rawPosTypeScoreData['starters'][player.nickname] = rawPitcherStats;

        const currentPitcher = player && rawPosTypeScoreData && rawPosTypeScoreData['starters'] && rawPosTypeScoreData['starters'][player.nickname];

        player.total = currentPitcher ? getStarterTotal(currentPitcher) : 0;
        rawPosTypeScoreData['starters'][player.nickname].total = player.total;
        rawPosTypeScoreData['starters'][player.nickname].newsLink = player.newsLink ? player.newsLink : '';

        const mergedPitcherData = {...player, ...currentPitcher};
        if (!positionScoreData['SP']) {
          positionScoreData['SP'] = {};
        }

        positionScoreData['SP'][mergedPitcherData.nickname] = mergedPitcherData;
      }
      
    }
    else  if (player.pos === 'RP') {
    /* 
    
    CLOSERS

    */
      if (player.nickname) {
        let rawRelieverStats = mlbPitchers && mlbPitchers[player.playerId];
        if (!rawRelieverStats) {
          rawRelieverStats = {
            wins: 0,
            ip: 0,
            saves: 0,
            losses: 0,
            strikeOuts: 0
          };
          const mergedCloserData = {...player, ...rawRelieverStats};
          if (!positionScoreData['RP']) {
            positionScoreData['RP'] = {};
          }

          positionScoreData['RP'][mergedCloserData.nickname] = mergedCloserData;
        }
        else { 
          rawRelieverStats.roster = roster.slug;
          rawRelieverStats.poolPos = player.pos;
          rawPosTypeScoreData['relievers'][player.nickname] = rawRelieverStats;
          const currentCloserPitcher = player && rawPosTypeScoreData && rawPosTypeScoreData['relievers'] && rawPosTypeScoreData['relievers'][player.nickname];
          player.total = currentCloserPitcher ? geCloserTotal(currentCloserPitcher) : 0;
          rawPosTypeScoreData['relievers'][player.nickname].total = player.total;
          rawPosTypeScoreData['relievers'][player.nickname].newsLink = player.newsLink ? player.newsLink : '';

          const mergedCloserData = {...player, ...currentCloserPitcher};
          if (!positionScoreData['RP']) {
            positionScoreData['RP'] = {};
          }

          positionScoreData['RP'][mergedCloserData.nickname] = mergedCloserData;
        }
      }
    }
    else {
      console.warn('| This does not have a clear position', player);
    }
  });





  


  // setCurrentRawScoreData(rawPosTypeScoreData);
  // setCurrentRoster({...roster});


  if (rawPosTypeScoreData) {
    try {
      window.localStorage.setItem(CONSTANTS.RAW_POS_STATS, JSON.stringify(rawPosTypeScoreData)); 
    }
     catch(error) {
       console.error('|  can not write RAW_POS_STATS', JSON.stringify(error) );
     }       

  }

    if (positionScoreData) {
      try {
        window.localStorage.setItem(CONSTANTS.ROSTER_STATS, JSON.stringify(positionScoreData));  
      }
       catch(error) {
         console.error('|  can not write ROSTER_STATS', JSON.stringify(error) );
       }  

    }
    return positionScoreData;

};



