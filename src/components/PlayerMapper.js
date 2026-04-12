import React, { useState, useEffect, useRef } from 'react';
import { getPitcherStats, getHitterStats } from '../data/fetchStats';
import styled from 'styled-components';
import { usePoolContext } from '../data/PoolContextProvider';
import rosters2026 from '../data/rosters2026.json';
import { saveRosters } from '../data/saveRosters';
import { CONSTANTS } from '../constants';

const ScrollBox = styled.div`
  height: 400px;
  overflow-y: scroll;
  border: 1px solid #dddddd;
  padding: 4px;
`;

const LogBox = styled.div`
  height: 400px;
  overflow-y: scroll;
  font-family: monospace;
  font-size: 12px;
  background: #1a1a1a;
  color: #cccccc;
  padding: 10px;
  border-radius: 3px;
`;

const LogLine = styled.div`
  padding: 3px 0;
  line-height: 1.5;
  color: ${props => {
    if (props.logstatus === 'matched') return '#4ec9b0';
    if (props.logstatus === 'not_found') return '#f48771';
    if (props.logstatus === 'summary') return '#dcdcaa';
    if (props.logstatus === 'error') return '#f48771';
    if (props.logstatus === 'info') return '#9cdcfe';
    return '#cccccc';
  }};
`;

const LogDetail = styled.div`
  padding-left: 20px;
  color: #666666;
  font-size: 11px;
`;

const LogDivider = styled.div`
  border-top: 1px solid #333333;
  margin: 6px 0;
  color: #dcdcaa;
  padding-top: 4px;
`;

const ControlBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #cccccc;
  background: #f5f5f5;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 4px 6px;
  margin-bottom: 4px;
  font-size: 12px;
  box-sizing: border-box;
  border: 1px solid #dddddd;
`;

const ColLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #555555;
`;

const PlayerRow = styled.div`
  padding: 2px 3px;
  background: ${props => props.selected ? '#e3f2fd' : 'transparent'};
  font-size: 11px;
`;

const PlayerBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  text-align: left;
  padding: 0;
`;

const MappedBadge = styled.span`
  display: inline-block;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  margin-right: 5px;
  background: ${props => props.ismapped === 'true' ? '#e8f5e9' : '#fff3e0'};
  color: ${props => props.ismapped === 'true' ? '#2e7d32' : '#e65100'};
`;

const TabRow = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 10px;
  border-bottom: 2px solid #dddddd;
`;

const TabBtn = styled.button`
  padding: 5px 14px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #dddddd;
  border-bottom: none;
  background: ${props => props.isactive === 'true' ? '#ffffff' : '#f5f5f5'};
  font-weight: ${props => props.isactive === 'true' ? '600' : 'normal'};
  margin-bottom: -2px;
`;

const SaveBar = styled.div`
  padding: 8px;
  background: #fffde7;
  border: 1px solid #ffe082;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
`;

// ─── helpers ───────────────────────────────────────────────────────────────

const normalizeName = (name) =>
  name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip accents: Díaz → diaz
    .replace(/\./g, '')               // strip periods: N. → N
    .replace(/\s+/g, ' ');

// ─── component ─────────────────────────────────────────────────────────────

export const PlayerMapper = ({ rosterData, savePlayer, refreshPlayers }) => {
  const { state, dispatch } = usePoolContext();

  // manual map selections
  const [selectedSourcePitcher, setSelectedSourcePitcher] = useState(null);
  const [selectedSourceHitter, setSelectedSourceHitter] = useState(null);
  const [selectedRosterPitcher, setSelectedRosterPitcher] = useState(null);
  const [selectedRosterHitter, setSelectedRosterHitter] = useState(null);

  // roster lists
  const [rosterHitters, setRosterHitters] = useState([]);
  const [rosterPitchers, setRosterPitchers] = useState([]);

  // view state
  const [isShowHitters, setIsShowHitters] = useState(true);
  const [activeTab, setActiveTab] = useState('automap');
  const [showMapped, setShowMapped] = useState(false);
  const [filterRoster, setFilterRoster] = useState('');
  const [filterMlb, setFilterMlb] = useState('');

  // log
  const [matchLog, setMatchLog] = useState([]);
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const logBoxRef = useRef(null);

  // ── populate roster lists from rosterData ──────────────────────────────
  useEffect(() => {
    if (!rosterData || !rosterData['bashers']) return;

    const hitters = [];
    const pitchers = [];
    Object.keys(rosterData).forEach((key) => {
      rosterData[key].players.forEach((player) => {
        if (player.posType === 'hitter') hitters.push(player);
        else pitchers.push(player);
      });
    });

    const byName = (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    hitters.sort(byName);
    pitchers.sort(byName);

    setRosterHitters(hitters);
    setRosterPitchers(pitchers);
  }, [rosterData]);

  // ── auto-scroll log to bottom ──────────────────────────────────────────
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [matchLog]);

  // ── load MLB stats ─────────────────────────────────────────────────────
  const onLoadPlayerStats = () => {
    getPitcherStats().then((data) => {
      if (!data || !data.stats) return;
      const statsObj = {};
      data.stats.forEach((p) => { statsObj[p.playerId] = p; });
      const payload = { timestamp: new Date().getTime(), stats: statsObj };
      dispatch({ type: 'setMlbPitchers', mlbPitchers: payload });
      try { window.localStorage.setItem(CONSTANTS.RAW_PITCHER_STATS, JSON.stringify(payload)); }
      catch (e) { console.error('cannot write RAW_PITCHER_STATS', e); }
    });

    getHitterStats().then((data) => {
      if (!data || !data.stats) return;
      const statsObj = {};
      data.stats.forEach((h) => { statsObj[h.playerId] = h; });
      const payload = { timestamp: new Date().getTime(), stats: statsObj };
      dispatch({ type: 'setMlbHitters', mlbHitters: payload });
      try { window.localStorage.setItem(CONSTANTS.RAW_HITTER_STATS, JSON.stringify(payload)); }
      catch (e) { console.error('cannot write RAW_HITTER_STATS', e); }
    });
  };

  // ── auto-map ──────────────────────────────────────────────────────────
  const onRunAutoMap = async () => {
    const sourceList = isShowHitters ? mHitters : mPitchers;
    const rosterList = isShowHitters ? rosterHitters : rosterPitchers;
    const targets = rosterList.filter(p => !p.playerId || p.playerId === 0);
    const typeLabel = isShowHitters ? 'hitters' : 'pitchers';

    setIsAutoMapping(true);
    setMatchLog([]);

    if (!sourceList || !sourceList.length) {
      setMatchLog([{ type: 'error', message: 'MLB data not loaded — click "Load Data" first.' }]);
      setIsAutoMapping(false);
      return;
    }

    if (!targets.length) {
      setMatchLog([{ type: 'info', message: `All ${typeLabel} are already mapped — nothing to do.` }]);
      setIsAutoMapping(false);
      return;
    }

    setMatchLog([{ type: 'info', message: `Starting auto-map for ${targets.length} unmapped ${typeLabel}...` }]);
    await new Promise(r => setTimeout(r, 80));

    let matched = 0;
    let notFound = 0;

    for (const player of targets) {
      await new Promise(r => setTimeout(r, 90));

      const normalRoster = normalizeName(player.name);
      const mlbMatch = sourceList.find(p => normalizeName(p.playerName) === normalRoster);

      if (mlbMatch) {
        player.playerId = mlbMatch.playerId;
        savePlayer(player);
        matched++;
        setMatchLog(prev => [...prev, {
          status: 'matched',
          playerName: player.name,
          roster: player.roster,
          pos: player.pos,
          mlbName: mlbMatch.playerName,
          playerId: mlbMatch.playerId,
        }]);
      } else {
        notFound++;
        setMatchLog(prev => [...prev, {
          status: 'not_found',
          playerName: player.name,
          roster: player.roster,
          pos: player.pos,
        }]);
      }
    }

    await new Promise(r => setTimeout(r, 120));
    setMatchLog(prev => [...prev, {
      type: 'summary',
      total: targets.length,
      matched,
      notFound,
    }]);
    setIsAutoMapping(false);
  };

  // ── manual save ────────────────────────────────────────────────────────
  const onSaveIdMatch = () => {
    if (selectedSourceHitter && selectedRosterHitter) {
      selectedRosterHitter.playerId = selectedSourceHitter.playerId;
      savePlayer(selectedRosterHitter);
    } else if (selectedSourcePitcher && selectedRosterPitcher) {
      selectedRosterPitcher.playerId = selectedSourcePitcher.playerId;
      savePlayer(selectedRosterPitcher);
    }
    setSelectedRosterPitcher(null);
    setSelectedSourcePitcher(null);
    setSelectedRosterHitter(null);
    setSelectedSourceHitter(null);
  };

  // ── derived lists ──────────────────────────────────────────────────────
  const mHitters = state?.mlbHitters?.stats
    ? Object.values(state.mlbHitters.stats).sort((a, b) => a.playerName < b.playerName ? -1 : 1)
    : null;

  const mPitchers = state?.mlbPitchers?.stats
    ? Object.values(state.mlbPitchers.stats).sort((a, b) => a.playerName < b.playerName ? -1 : 1)
    : null;

  const activeRosterList = (isShowHitters ? rosterHitters : rosterPitchers)
    .filter(p => showMapped || !p.playerId || p.playerId === 0)
    .filter(p => !filterRoster || p.name.toLowerCase().includes(filterRoster.toLowerCase()));

  const filteredMlbList = ((isShowHitters ? mHitters : mPitchers) || [])
    .filter(p => !filterMlb || p.playerName.toLowerCase().includes(filterMlb.toLowerCase()));

  const unmappedCount = (isShowHitters ? rosterHitters : rosterPitchers)
    .filter(p => !p.playerId || p.playerId === 0).length;

  const pendingManualMatch =
    (selectedSourceHitter && selectedRosterHitter) ||
    (selectedSourcePitcher && selectedRosterPitcher);

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ border: '1px solid #ee9999', padding: '.5rem' }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Player Mapper</h2>

      <ControlBar>
        <Btn onClick={onLoadPlayerStats}>Load Data</Btn>
        <Btn onClick={() => {
          setIsShowHitters(!isShowHitters);
          setFilterRoster('');
          setFilterMlb('');
        }}>
          {isShowHitters ? 'Showing: Hitters' : 'Showing: Pitchers'}
        </Btn>
        <span style={{ fontSize: 11, color: '#888' }}>
          {unmappedCount} unmapped {isShowHitters ? 'hitters' : 'pitchers'}
          {(mHitters || mPitchers) ? '' : ' · MLB data not loaded'}
        </span>
      </ControlBar>

      <TabRow>
        <TabBtn
          isactive={(activeTab === 'automap').toString()}
          onClick={() => setActiveTab('automap')}
        >
          Auto-Map
        </TabBtn>
        <TabBtn
          isactive={(activeTab === 'manual').toString()}
          onClick={() => setActiveTab('manual')}
        >
          Manual Map
        </TabBtn>
      </TabRow>

      {/* ── AUTO-MAP TAB ── */}
      {activeTab === 'automap' && (
        <div>
          <ControlBar>
            <Btn onClick={onRunAutoMap} disabled={isAutoMapping}>
              {isAutoMapping ? 'Running…' : 'Run Auto-Map'}
            </Btn>
            {matchLog.length > 0 && !isAutoMapping && (
              <Btn onClick={() => setMatchLog([])}>Clear Log</Btn>
            )}
          </ControlBar>

          <LogBox ref={logBoxRef}>
            {matchLog.length === 0 && (
              <span style={{ color: '#555' }}>
                Press "Run Auto-Map" to attempt automatic name matching for all unmapped{' '}
                {isShowHitters ? 'hitters' : 'pitchers'}.
              </span>
            )}

            {matchLog.map((entry, i) => {
              if (entry.type === 'error') return (
                <LogLine key={i} logstatus="error">⚠  {entry.message}</LogLine>
              );

              if (entry.type === 'info') return (
                <LogLine key={i} logstatus="info">ℹ  {entry.message}</LogLine>
              );

              if (entry.type === 'summary') return (
                <LogDivider key={i}>
                  ✔ Complete — {entry.matched} matched, {entry.notFound} not found
                  {entry.notFound > 0 ? ' (use Manual Map tab for the remainder)' : ' — all done!'}
                </LogDivider>
              );

              if (entry.status === 'matched') return (
                <LogLine key={i} logstatus="matched">
                  ✓  {entry.playerName}{' '}
                  <span style={{ color: '#608b4e', fontSize: 10 }}>
                    ({entry.roster} · {entry.pos})
                  </span>
                  <LogDetail>
                    → matched "{entry.mlbName}" [ID: {entry.playerId}] — saved ✓
                  </LogDetail>
                </LogLine>
              );

              if (entry.status === 'not_found') return (
                <LogLine key={i} logstatus="not_found">
                  ✗  {entry.playerName}{' '}
                  <span style={{ color: '#666', fontSize: 10 }}>
                    ({entry.roster} · {entry.pos})
                  </span>
                  <LogDetail>
                    → no match found in MLB data — use Manual Map tab
                  </LogDetail>
                </LogLine>
              );

              return null;
            })}
          </LogBox>
        </div>
      )}

      {/* ── MANUAL MAP TAB ── */}
      {activeTab === 'manual' && (
        <div>
          {pendingManualMatch && (
            <SaveBar>
              <span>
                Map{' '}
                <strong>{(selectedRosterHitter || selectedRosterPitcher).name}</strong>
                {' → '}
                <strong>{(selectedSourceHitter || selectedSourcePitcher).playerName}</strong>
                {' '}[{(selectedSourceHitter || selectedSourcePitcher).playerId}]
              </span>
              <Btn onClick={onSaveIdMatch}>Save Match</Btn>
              <Btn onClick={() => {
                setSelectedRosterHitter(null); setSelectedRosterPitcher(null);
                setSelectedSourceHitter(null); setSelectedSourcePitcher(null);
              }}>Cancel</Btn>
            </SaveBar>
          )}

          <div style={{ marginBottom: 8, fontSize: 11 }}>
            <label>
              <input
                type="checkbox"
                checked={showMapped}
                onChange={e => setShowMapped(e.target.checked)}
              />{' '}
              Show already-mapped players
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <ColLabel>Roster ({activeRosterList.length})</ColLabel>
              <FilterInput
                placeholder="Filter roster…"
                value={filterRoster}
                onChange={e => setFilterRoster(e.target.value)}
              />
              <ScrollBox>
                {activeRosterList.map((player, i) => {
                  const isSelected =
                    player === selectedRosterHitter || player === selectedRosterPitcher;
                  const isMapped = player.playerId > 0;
                  return (
                    <PlayerRow key={i} selected={isSelected}>
                      <MappedBadge ismapped={isMapped.toString()}>
                        {isMapped ? 'mapped' : 'unmapped'}
                      </MappedBadge>
                      <PlayerBtn
                        onClick={() => {
                          if (player.posType === 'hitter') {
                            setSelectedRosterHitter(isSelected ? null : player);
                          } else {
                            setSelectedRosterPitcher(isSelected ? null : player);
                          }
                        }}
                      >
                        {player.name}
                        <span style={{ color: '#999', fontSize: 10, marginLeft: 4 }}>
                          {player.roster} · {player.team} · {player.pos}
                        </span>
                      </PlayerBtn>
                    </PlayerRow>
                  );
                })}
              </ScrollBox>
            </div>

            <div style={{ flex: 1 }}>
              <ColLabel>
                MLB {isShowHitters ? 'Hitters' : 'Pitchers'} ({filteredMlbList.length})
              </ColLabel>
              <FilterInput
                placeholder="Filter MLB players…"
                value={filterMlb}
                onChange={e => setFilterMlb(e.target.value)}
              />
              <ScrollBox>
                {!filteredMlbList.length && (
                  <div style={{ fontSize: 11, color: '#999', padding: 4 }}>
                    {(isShowHitters ? mHitters : mPitchers)
                      ? 'No results'
                      : 'Load data first'}
                  </div>
                )}
                {filteredMlbList.map((player, i) => {
                  const isSelected =
                    player === selectedSourceHitter || player === selectedSourcePitcher;
                  return (
                    <PlayerRow key={i} selected={isSelected}>
                      <PlayerBtn
                        onClick={() => {
                          if (isShowHitters) {
                            setSelectedSourceHitter(isSelected ? null : player);
                          } else {
                            setSelectedSourcePitcher(isSelected ? null : player);
                          }
                        }}
                      >
                        {player.playerName}
                        <span style={{ color: '#999', fontSize: 10, marginLeft: 4 }}>
                          [{player.playerId}]
                        </span>
                      </PlayerBtn>
                    </PlayerRow>
                  );
                })}
              </ScrollBox>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
