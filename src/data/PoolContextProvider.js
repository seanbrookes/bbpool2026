import * as React from 'react';
import rosters2023 from '../data/rosters2023.json';

const PoolContext = React.createContext();

const poolReducer = (state, action) => {
  switch (action.type) {
    case 'setGrandTotals': {
      const copyState = {...state};
      copyState.grandTotals = action.rosterTotals;
      return copyState;
    }
    case 'setLastUpdateTimestamp': {
      const copyState = {...state};
      copyState.timestamp = action.timestamp;
      return copyState;
    }
    case 'setMlbHitters': {
      const copyState = {...state};
      copyState.mlbHitters = action.mlbHitters;
      return copyState;
    }
    case 'setMlbPitchers': {
      const copyState = {...state};
      copyState.mlbPitchers = action.mlbPitchers;
      return copyState;
    }

    default: {
     console.warn(`| poolReducer: Unhandled action type: ${action.type}`);
    }
  }
};

let rosterBlob = rosters2023;
Object.keys(rosterBlob).map((rosterKey) => {
  rosterBlob[rosterKey].players.map((player) => {
    if (!player.roster) {
      player.roster = rosterKey;
    }
  })
});

const defaultGrandTotals = {
  timestamp: 0,
  bashers: {
    grandTotal: 0,
    delta: 0
  },
  mashers: {
    grandTotal: 0,
    delta: 0
  },
  rallycaps: {
    grandTotal: 0,
    delta: 0
  },
  stallions: {
    grandTotal: 0,
    delta: 0
  }
};

const PoolContextProvider = ({children}) => {
  const [state, dispatch] = React.useReducer(poolReducer, {rosterData: rosterBlob, grandTotals: defaultGrandTotals, lastUpdateTimestamp: 0})
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {state, dispatch}
  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>
};



const usePoolContext = () => {
  const context = React.useContext(PoolContext);
  if (context === undefined) {
    console.warn(`| poolReducer: useCount must be used within a PoolProvider`);
  }
  return context;
};


export {PoolContextProvider, usePoolContext};
