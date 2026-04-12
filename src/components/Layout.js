import React from 'react';
import styled from 'styled-components';
import { PageHeader } from './PageHeader';
import { usePoolContext } from '../data/PoolContextProvider';
import Link from 'next/link';

const SideBarContainer = styled.div`
  display: flex;
`;

const PosListContainer = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    margin-left: 1rem;
    margin-right: .5rem;
    margin-bottom: 1.5rem;
    padding: 0;
  }
`;
const RosterNavTable = styled.table`
  padding: 0;
  margin: 0;

  td {
    margin: 0;
    padding: 0;
    border: 1px solid #eeeeee;
  }
`;
const RosterNavListItem = styled.tr`

`;

const RosterNavRoster = styled.div`
  text-transform: capitalize;
  font-size: 12px;

  a {
    text-decoration: none;

    &hover {
      text-decoration: underline;
    }
  }
`;

const RosterNavTotal = styled.div`
font-size: 14px;
`;

const RosterNavDelta = styled.div`
font-size: 12px;
`;

const MainContentContainer = styled.div`

`;
export const TotalRankNav = ({rosterTotals}) => {


  let navItems = [];


  let rosterCollection = Object.keys(rosterTotals).map((rosterKey) => {
    const currentRoster = rosterTotals[rosterKey];
    return currentRoster;

  }); 

  rosterCollection.sort((a, b) => {
    var x = a.grandTotal;
    var y = b.grandTotal;
    return x > y ? -1 : x < y ? 1 : 0;
  });


  navItems = rosterCollection.map((roster) => {
    if (roster.roster) {
      return (
        <RosterNavListItem>
          <td>
          <RosterNavRoster><a href={`/#${roster.roster}`}>{roster.roster}:</a></RosterNavRoster>
          </td>
          <td>
          <RosterNavTotal>{parseFloat(roster.grandTotal).toFixed(2)} </RosterNavTotal>
          </td>
          <td>
          <RosterNavDelta style={{display: 'none'}}>({parseFloat(roster.delta).toFixed(2)})</RosterNavDelta>
          </td>
        </RosterNavListItem>
      );
  
    }
  });

  return (
    <div style={{marginTop: '1rem'}}>
      <RosterNavTable>
        {navItems}
      </RosterNavTable>
    </div>
  );
};
export const Layout = ({children}) => {
  const { state, dispatch } = usePoolContext();


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

  return(
    <div>
      <PageHeader />
      <SideBarContainer>
        <div style={{padding: '0 .5rem 0 0'}}>
          <TotalRankNav rosterTotals={state.grandTotals} />

          <div style={{marginTop: '1rem'}}>
            <PosListContainer>
            {posList.map((pos, index) => {
              return (
                <li key={index}>
                  <Link href={`/pos/${pos === 'All hitters' ? 'hitters' : pos}`}><a>{pos}</a></Link>
                  
                </li>
              )
            })}
            </PosListContainer>
          </div>
        </div>
        <MainContentContainer >
          {children}
        </MainContentContainer>
      </SideBarContainer>
    </div>
  );
}