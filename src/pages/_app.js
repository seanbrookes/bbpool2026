import React, { useEffect } from 'react';
import { PoolContextProvider } from '../data/PoolContextProvider';
import { CONSTANTS } from '../constants';

const Main = ({ Component, pageProps }) => {


  useEffect(() => {
    window.localStorage.setItem(CONSTANTS.ROSTER_DATA_NAME , '');
    window.localStorage.setItem(CONSTANTS.RAW_PITCHER_STATS , '');
    window.localStorage.setItem(CONSTANTS.RAW_HITTER_STATS , '');
    window.localStorage.setItem(CONSTANTS.ROSTER_STATS , '');
    window.localStorage.setItem(CONSTANTS.RAW_POS_STATS , '');
    window.localStorage.setItem(CONSTANTS.GRAND_TOTALS_HISTORY , '');
  }, []);


  return (
    <PoolContextProvider>
      <Component {...pageProps} />
    </PoolContextProvider>
  );
};

export default Main;
