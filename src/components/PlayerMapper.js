import React, {useState, useEffect}  from 'react';
import { getPitcherStats, getHitterStats } from '../data/fetchStats';
import styled from 'styled-components';
import { usePoolContext } from '../data/PoolContextProvider';
import rosters2023 from '../data/rosters2023.json';
import { saveRosters } from '../data/saveRosters';
import { CONSTANTS } from '../constants';

const MlbPlayerScrollBox = styled.div`
  height: 500px;
  overflow-y: scroll;
  display: block;
`;




export const PlayerMapper = ({rosterData, savePlayer, refreshPlayers}) => {
  const { state, dispatch } = usePoolContext();
  const [selectedSourcePitcher,setSelectedSourcePitcher] = useState(null);
  const [selectedSourceHitter, setSelectedSourceHitter] = useState(null);
  const [selectedRosterPitcher,setSelectedRosterPitcher] = useState(null);
  const [selectedRosterHitter, setSelectedRosterHitter] = useState(null);
  const [rosterHitters, setRosterHitters] = useState([]);
  const [rosterPitchers, setRosterPitchers] = useState([]);
  const [isShowHitters, setIsShowHitters] = useState(true);



  useEffect(() => {
   // onLoadPlayerStats();



  //  saveRosters(rosters2021);




    if (rosterData && rosterData['bashers']) {
      const initRosterHitters = [];
      const initRosterPitchers = [];
      Object.keys(rosterData).map((key) => {
        const roster = rosterData[key];
        roster.players.map((player) => {
          if (player.posType === 'hitter') {
            initRosterHitters.push(player);
          }
          else {
            initRosterPitchers.push(player);
          }
        })

      });
      initRosterHitters.sort((a, b) => {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
      });
      initRosterPitchers.sort((a, b) => {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
      });
      setRosterHitters(initRosterHitters);
      setRosterPitchers(initRosterPitchers);

      const preExistingPitcherStats = window.localStorage.getItem(CONSTANTS.RAW_PITCHER_STATS);
      const preExistingHitterStats = window.localStorage.getItem(CONSTANTS.RAW_PITCHER_STATS); 



    }
  }, [rosterData]);

  const onLoadPlayerStats = () => {
    console.log('go');
          // Pitchers
          getPitcherStats()
          .then((data) => {
          //  console.log('got the pitchers data', data);
            if (data && data.stats) {
              data.stats.sort((a, b) => {
                var x = a.playerName.toLowerCase();
                var y = b.playerName.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
              });
              const pitcherStatsObj = {};
              data.stats.map((pitcher) => {
    
              //  if (playerKeyBlob[pitcher.playerId]) {
                  pitcherStatsObj[pitcher.playerId] = pitcher;
              //  }
    
              });
              const localLatestPitcherStats = {
                timestamp: new Date().getTime(),
                stats: pitcherStatsObj
              };
              dispatch({type: 'setMlbPitchers', mlbPitchers: localLatestPitcherStats});
             // setMlbPitchers(localLatestPitcherStats);
    
             try {
              window.localStorage.setItem(CONSTANTS.RAW_PITCHER_STATS, JSON.stringify(localLatestPitcherStats));  
             }
             catch(error) {
               console.error('|  can not write RAW_PITCHER_STATS', JSON.stringify(error) );
             }
            }
            else {
              console.warn(`| invalid attempt to set Pitcher data  ${JSON.stringify(data)}`)
            }
          });
          // Hitters
          getHitterStats()
          .then((data) => {
           // console.log('got the hitters data', data);
            if (data && data.stats) {
              data.stats.sort((a, b) => {
                var x = a.playerName.toLowerCase();
                var y = b.playerName.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
              });
              const hitterStatsObj = {};
              data.stats.map((hitter) => {
                
             //   if (playerKeyBlob[hitter.playerId]) {
                  hitterStatsObj[hitter.playerId] = hitter;
              //  }
              });
              const localLatestHitterStats = {
                timestamp: new Date().getTime(),
                stats: hitterStatsObj
              };
              dispatch({type: 'setMlbHitters', mlbHitters: localLatestHitterStats});
          //    setMlbHitters(localLatestHitterStats);
    
              try {
                window.localStorage.setItem(CONSTANTS.RAW_HITTER_STATS, JSON.stringify(localLatestHitterStats));
              }
               catch(error) {
                 console.error('|  can not write RAW_HITTER_STATS', JSON.stringify(error) );
               }  
            }
            else {
              console.warn(`| invalid attempt to set Hitter data  ${JSON.stringify(data)}`)
            }
          });
  };

  const onSaveIdMatch = () => {
    if (selectedSourceHitter && selectedRosterHitter) {
      // save this hitter
      selectedRosterHitter.playerId = selectedSourceHitter.playerId;
      savePlayer(selectedRosterHitter);

    }
    else if (selectedSourcePitcher && selectedRosterPitcher) {
      // save this pitcher
      selectedRosterPitcher.playerId = selectedSourcePitcher.playerId;
      savePlayer(selectedRosterPitcher);



    }

    setSelectedRosterPitcher(null);
    setSelectedSourcePitcher(null);
    setSelectedRosterHitter(null);
    setSelectedSourceHitter(null);
  }

  const onSelectSourcePitcher = (event, player) => {
    setSelectedSourcePitcher(player);
  };
  const onSelectRosterPitcher = (event, player) => {
    setSelectedRosterPitcher(player);
  };
  const onSelectRosterHitter = (event, player) => {
    setSelectedRosterHitter(player);
  };
  const onSelectSourceHitter = (event, player) => {
    setSelectedSourceHitter(player);
  };

  const mHitters = state && state.mlbHitters && state.mlbHitters.stats && Object.keys(state.mlbHitters.stats).map((key) => {
    return state.mlbHitters.stats[key];
  });

  // const xyz = state && state.mlbHitters && state.mlbHitters.stats;
  if (mHitters) {
    mHitters.sort((a, b) => {
      var x = a.playerName.toLowerCase();
      var y = b.playerName.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  const mPitchers = state && state.mlbPitchers && state.mlbPitchers.stats && Object.keys(state.mlbPitchers.stats).map((key) => {
    return state.mlbPitchers.stats[key];
  });

  // const xyz = state && state.mlbHitters && state.mlbHitters.stats;
  if (mPitchers) {
    mPitchers.sort((a, b) => {
      var x = a.playerName.toLowerCase();
      var y = b.playerName.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
  }




  return (
    <div style={{border: '1px solid #ee9999', padding: '.5rem' }}>
      <h2>Player Mapper</h2>
      <button onClick={onLoadPlayerStats}>Load Data</button>
      <button onClick={(event) => {return setIsShowHitters(!isShowHitters)}}>hitters[{isShowHitters.toString()}]/pitchers</button>
      {((selectedSourcePitcher && selectedRosterPitcher) || (selectedSourceHitter && selectedRosterHitter) ) ? <div style={{padding: '2rem'}}><button onClick={onSaveIdMatch}>Save It</button></div> : null}
      <div style={{display: 'flex'}}>
      <div>roster: {selectedRosterHitter && selectedRosterHitter.name && <button onClick={(event) => onSelectRosterHitter(event, null)}>{selectedRosterHitter.name}</button>}{selectedRosterPitcher && selectedRosterPitcher.name && <button onClick={(event) => onSelectRosterPitcher(event, null)}>{selectedRosterPitcher.name}</button>}</div>
      <div>source: {selectedSourceHitter && selectedSourceHitter.playerName && <button onClick={(event) => onSelectSourceHitter(event, null)}>{selectedSourceHitter.playerName}</button>}{selectedSourcePitcher && selectedSourcePitcher.playerName && <button onClick={(event) => onSelectSourcePitcher(event, null)}>{selectedSourcePitcher.playerName}</button>}</div>
      </div>
      {/* stats <pre>{JSON.stringify(mlbHitters, null, 2)}</pre> */}
      <div style={{display: 'flex'}}>
        <div>
          {isShowHitters && <div>
            <h2>Hitters</h2>
            <div style={{display: 'flex'}}>
              <div>
                <div>Roster Hitters</div>
                <MlbPlayerScrollBox>
                {rosterHitters && rosterHitters.map((rosterHitter, index) => {
                  // if (rosterHitter.playerId) {
                  //   return (<div />);
                  // }
                  // else {
                    return (<div key={index}>{index + 1}) {rosterHitter.roster} <button onClick={(event) => onSelectRosterHitter(event, rosterHitter)} >{rosterHitter.playerId}{rosterHitter.name}</button></div>);
                  // }
                })}
                </MlbPlayerScrollBox>

              </div>
              <div>
                <div>Hitters</div>
                <MlbPlayerScrollBox>
                  {mHitters && mHitters.map((hitter, index) => {
                    return (<div key={index}>{index + 1}) <button onClick={(event) => onSelectSourceHitter(event, hitter)} >{hitter.playerName}[{hitter.playerId}]</button></div>)
                  })}
                </MlbPlayerScrollBox>
              </div>
            </div>
          </div>
          }



          {!isShowHitters && <div>
            <h2>Pitchers</h2>
            <div style={{display: 'flex'}}>
              <div>
                <div>Roster Pitchers</div>
                <MlbPlayerScrollBox>
                  {rosterPitchers && rosterPitchers.map((rosterPitcher, index) => {
                    // if (rosterPitcher.playerId) {
                    //   return (<div/>);
                    // }
                    // else {
                      return (<div key={index}>{index + 1}) <button onClick={(event) => onSelectRosterPitcher(event, rosterPitcher)} >{rosterPitcher.playerId}{rosterPitcher.name}</button></div>)
                    // }
                  })}
                </MlbPlayerScrollBox>
              </div>
              <div>
                <div>Pitchers</div>
                <MlbPlayerScrollBox>
                {mPitchers && mPitchers.map((pitcher, index) => {
                  return (<div key={index}>{index + 1}) <button onClick={(event) => onSelectSourcePitcher(event, pitcher)} >{pitcher.playerName}[{pitcher.playerId}]</button></div>)
                })}
                </MlbPlayerScrollBox>
              </div>
            </div>            
          </div>

          }



        </div>

      </div>
    </div>
  );
}