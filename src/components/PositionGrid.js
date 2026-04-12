import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { PageHeader } from '../components/PageHeader';
import { CONSTANTS } from '../constants';

const Flex = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
`;

const ColSortButton = styled.button`
  background: '#ededed';
  background: transparent;
  color: darkblue;
  border: 0;
  cursor: pointer;

  &hover {
    text-decoration: underline
  }
`;

const PosTable = styled.table`

`;
const RegCel = styled.td`
  padding: .2rem;
  border: 1px solid #f1f1f1;
  font-weight: 400;
`;
const TotalCell = styled.td`
  padding: 0 .7rem 0 .7rem;
  background: #efefef;
  font-weight: 500;
`;

export const PositionGrid = ({pos}) => {
  const [allHitters, setAllHitters] = useState([]);
  const [allStarters, setAllStarters] = useState([]);
  const [allClosers, setAllClosers] = useState([]);
  const [currentSortCol, setCurrentSortCol] =  useState('total');
  const [isSortDesc, setIsSortDesc] = useState(true);

  useEffect(() => {
    //if (pos) {
      let rawPosStats;
      try {
        rawPosStats = window.localStorage.getItem(CONSTANTS.RAW_POS_STATS);
      }
       catch(error) {
         console.error('|  can not fetch RAW_POS_STATS', JSON.stringify(error) );
       }
      if (rawPosStats) {
        const parstedRawPosStats = JSON.parse(rawPosStats);
        const thisHitters = Object.keys(parstedRawPosStats.hitters).map((hitterKey) => parstedRawPosStats.hitters[hitterKey]);
        thisHitters.sort((a, b) => {
          var x = a[currentSortCol];
          var y = b[currentSortCol];
          if (isSortDesc) {
            return x > y ? -1 : x < y ? 1 : 0;
          }
          return x < y ? -1 : x > y ? 1 : 0;
        });
        setAllHitters(thisHitters);
        const thisStarters = Object.keys(parstedRawPosStats.starters).map((starterKey) => parstedRawPosStats.starters[starterKey]);
        thisStarters.sort((a, b) => {
          var x = a[currentSortCol];
          var y = b[currentSortCol];
          if (isSortDesc) {
            return x > y ? -1 : x < y ? 1 : 0;
          }
          return x < y ? -1 : x > y ? 1 : 0;
        });
        setAllStarters(thisStarters);
        const thisClosers = Object.keys(parstedRawPosStats.relievers).map((relieverKey) => parstedRawPosStats.relievers[relieverKey]);
        thisClosers.sort((a, b) => {
          var x = a[currentSortCol];
          var y = b[currentSortCol];
          if (isSortDesc) {
            return x > y ? -1 : x < y ? 1 : 0;
          }
          return x < y ? -1 : x > y ? 1 : 0;
        });
        setAllClosers(thisClosers);
      } 
 //   }
  }, [pos, currentSortCol, isSortDesc]);

  const onSortTable = (event, property) => {
    setCurrentSortCol(property);
    setIsSortDesc(!isSortDesc);
  };


  let tableRows = [];
  let tableType = 'hitters';
  if (pos === 'SP') {
    tableType = 'starters';
    tableRows = allStarters && allStarters.map((starter, index) => {
      return (
        <tr>
          <RegCel>{index + 1}</RegCel>          
          <RegCel>{starter.roster}</RegCel>
          <RegCel><a target="_new" href={starter.newsLink}>{starter.playerName}</a></RegCel>
          <RegCel>{starter.poolPos}</RegCel>
          <RegCel>{starter.teamAbbrev}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{starter.wins}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{starter.losses}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{starter.strikeOuts}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{starter.inningsPitched}</RegCel>
          <TotalCell>{starter.total}</TotalCell>
        </tr>
      ); 
    });
  }
  else if (pos === 'RP') {

    tableType = 'relievers';
    tableRows = allClosers && allClosers.map((reliever, index) => {
      return (
        <tr key={`${index}-xyx`}>
        <RegCel>{index + 1}</RegCel>
        <RegCel>{reliever.roster}</RegCel>
        <RegCel><a target="_new" href={reliever.newsLink}>{reliever.playerName}</a></RegCel>
        <RegCel>{reliever.poolPos}</RegCel>
        <RegCel>{reliever.teamAbbrev}</RegCel>
        <RegCel style={{textAlign: 'center'}}>{reliever.wins}</RegCel>
        <RegCel style={{textAlign: 'center'}}>{reliever.losses}</RegCel>
        <RegCel style={{textAlign: 'center'}}>{reliever.saves}</RegCel>
        <RegCel style={{textAlign: 'center'}}>{reliever.strikeOuts}</RegCel>
        <RegCel style={{textAlign: 'center'}}>{reliever.inningsPitched}</RegCel>
        <TotalCell>{reliever.total}</TotalCell>
      </tr>
      ); 
    });  
  }
  else if (pos === 'All') {
    tableType = 'hitters';
    tableRows = allHitters && allHitters.map((hitter, index) => {
      return (
        <tr key={`${index}-xx`}>
          <RegCel>{index + 1}</RegCel>
          <RegCel>{hitter.roster}</RegCel>
          <RegCel><a target="_new" href={hitter.newsLink}>{hitter.playerName}</a></RegCel>
          <RegCel>{hitter.poolPos}</RegCel>
          <RegCel>{hitter.teamAbbrev}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{hitter.runs}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{hitter.hits}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{hitter.homeRuns}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{hitter.rbi}</RegCel>
          <RegCel style={{textAlign: 'center'}}>{hitter.stolenBases}</RegCel>
          <TotalCell>{hitter.total}</TotalCell>
        </tr>
      );  
    });
  }
  else if (pos) {
    tableRows = allHitters && allHitters.map((hitter, index) => {
      if (pos === 'OF' && (hitter.poolPos === 'LF' || hitter.poolPos === 'RF' || hitter.poolPos === 'CF' || hitter.poolPos == 'OF')) {
        return (
          <tr key={`${index}-abx`}>
            <RegCel>{index + 1}</RegCel>
            <RegCel>{hitter.roster}</RegCel>
            <RegCel><a target="_new" href={hitter.newsLink}>{hitter.playerName}</a></RegCel>
            <RegCel>{hitter.poolPos}</RegCel>
            <RegCel>{hitter.teamAbbrev}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.runs}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.hits}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.homeRuns}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.rbi}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.stolenBases}</RegCel>
            <TotalCell>{hitter.total}</TotalCell>
          </tr>
        );       
      }
      else if (pos === hitter.poolPos) {
        return (
          <tr key={`${index}-ccx`}>
            <RegCel>{index + 1}</RegCel>
            <RegCel>{hitter.roster}</RegCel>
            <RegCel><a target="_new" href={hitter.newsLink}>{hitter.playerName}</a></RegCel>
            <RegCel>{hitter.poolPos}</RegCel>
            <RegCel>{hitter.teamAbbrev}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.runs}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.hits}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.homeRuns}</RegCel>
            <RegCel style={{textAlign: 'center'}}>{hitter.rbi}</RegCel>            
            <RegCel style={{textAlign: 'center'}}>{hitter.stolenBases}</RegCel>
            <TotalCell>{hitter.total}</TotalCell>
          </tr>
        ); 
      } 
    });   
  }

  const posList = [
    'All',
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

  let tableHeader = null;
  switch(tableType) {

    case 'starters': {
      tableHeader = (
        <tr>
          <th></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'roster')}>roster</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'name')}>name</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'pos')}>pos</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'team')}>team</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'wins')}>W</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'losses')}>L</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'strikeouts')}>K</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'inningsPitched')}>IP</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'total')}>total</ColSortButton></th>
        </tr>
      );
      break;

    }
    case 'relievers': {
      tableHeader = (
        <tr>
          <th></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'roster')}>roster</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'playerName')}>name</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'poolPos')}>pos</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'teamAbbrev')}>team</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'wins')}>W</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'losses')}>L</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'saves')}>Sv</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'strikeOuts')}>K</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'inningsPitched')}>IP</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'total')}>total</ColSortButton></th>
        </tr>
      );
      break;      
    }


    default: {
      tableHeader = (
        <tr>
          <th></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'roster')}>roster</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'playerName')}>name</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'poolPos')}>pos</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'teamAbbrev')}>team</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'runs')}>Runs</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'hits')}>Hits</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'homeRuns')}>HR</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'rbi')}>RBI</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'stolenBases')}>SB</ColSortButton></th>
          <th><ColSortButton onClick={(event) => onSortTable(event, 'total')}>total</ColSortButton></th>
        </tr>
      );     
    }



  }


  return (

    <div >

      <PosTable>
        <caption>position {pos}</caption>
        <thead>
          {tableHeader}
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </PosTable>
    </div>
  );
}
