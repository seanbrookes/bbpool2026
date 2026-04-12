import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { CONSTANTS } from '../constants';

const PosTable = styled.table`
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

const PosLabel = styled.div`
  font-size: 9px;
  color: #777777;
  text-align: left;
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

export const ClosersPosContainer = ({pitchersBlob, roster}) => {
  const thePosition = pitchersBlob && pitchersBlob['RP'];
  const allPosition = thePosition ? Object.keys(thePosition).map((key) => thePosition[key]): [];
  const rosterPosition = allPosition && allPosition.filter((player) => {
    return player.roster === roster;
  }).sort((a, b) => {
    var x = a.total;
    var y = b.total;
    return x > y ? -1 : x < y ? 1 : 0;
  });
  return (
    <PosTable>
      <thead>
        <tr>
          <th></th>
          <th><Link href={`/pos/RP`}><a><PosLabel>Closers</PosLabel></a></Link></th>
          <th></th>
          <th>sv</th>
          <th>w</th>
          <th>l</th>
          <th>k</th>
          <th>ip</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody>   
      {rosterPosition && rosterPosition.map((player, index) => {
        let rowStyle = {};
        if (index < 2) {
          rowStyle['backgroundColor'] = '#efefef';
          rowStyle['fontWeight'] = 400;
        }
        else {
          rowStyle['fontWeight'] = 300;
          rowStyle['color'] = '#777777';
        }
        if (player.status && player.status === 'prospect') {
          rowStyle['backgroundColor'] = '#eff1fc';          
        }      
        return (
          <tr style={rowStyle} key={index}>
            <td style={{fontSize: '9px', color: '#444444'}}>{index + 1}</td>
            <td><NameCell><a target="_new" href={player.newsLink}>{player.name}</a></NameCell></td>
            <td><TeamCell>{player.team}</TeamCell></td>
            <td><RunsCell>{player.saves}</RunsCell></td>
            <td><HitsCell>{player.wins}</HitsCell></td>
            <td><HRCell>{player.losses}</HRCell></td>
            <td><RBICell>{player.strikeOuts}</RBICell></td>
            <td><SBCell>{player.inningsPitched}</SBCell></td>
            <td><TotalCell>{player.total}</TotalCell></td>
          </tr>
        );
      })}
      </tbody>
    </PosTable>
  );
};