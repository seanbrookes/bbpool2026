import React, { useState } from 'react';
import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

const Label = styled.label`
  width: 70px;
  font-size: 12px;
  color: #555;
  flex-shrink: 0;
`;

const TextInput = styled.input`
  padding: 3px 6px;
  font-size: 12px;
  border: 1px solid #cccccc;
  width: 200px;
`;

const Select = styled.select`
  padding: 3px 6px;
  font-size: 12px;
  border: 1px solid #cccccc;
`;

const SaveBtn = styled.button`
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #cccccc;
  background: #f5f5f5;
  margin-top: 4px;
`;

const ValidationMsg = styled.div`
  font-size: 11px;
  color: #c62828;
  margin-top: 4px;
`;

const SuccessMsg = styled.div`
  font-size: 11px;
  color: #2e7d32;
  margin-top: 4px;
`;

const AL_TEAMS = ['ATH', 'BAL', 'BOS', 'CWS', 'CLE', 'DET', 'HOU', 'KC', 'LAA', 'MIN', 'NYY', 'SEA', 'TB', 'TEX', 'TOR'];
const POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH', 'SP', 'RP'];
const ROSTERS = [
  { value: 'bashers', label: 'Bashers' },
  { value: 'mashers', label: 'Mashers' },
  { value: 'rallycaps', label: 'Rally Caps' },
  { value: 'stallions', label: 'Stallions' },
];

const toNickname = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

const emptyPlayer = () => ({
  name: '', roster: '', pos: '', team: '', status: 'regular', playerId: 0, newsLink: '',
});

export const AddPlayerForm = ({ savePlayer }) => {
  const [player, setPlayer] = useState(emptyPlayer());
  const [validationMsg, setValidationMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const set = (field, value) => {
    setValidationMsg('');
    setSuccessMsg('');
    setPlayer(prev => ({ ...prev, [field]: value }));
  };

  const onSave = () => {
    const { name, roster, pos, team } = player;
    if (!name.trim()) return setValidationMsg('Name is required.');
    if (!roster) return setValidationMsg('Roster is required.');
    if (!pos) return setValidationMsg('Position is required.');
    if (!team) return setValidationMsg('Team is required.');

    const toSave = {
      ...player,
      name: name.trim(),
      nickname: toNickname(name),
      posType: (pos === 'SP' || pos === 'RP') ? 'pitcher' : 'hitter',
      playerId: Number(player.playerId) || 0,
      total: 0,
    };

    savePlayer(toSave);
    setSuccessMsg(`${toSave.name} added to ${roster}.`);
    setPlayer(emptyPlayer());
  };

  return (
    <div style={{ border: '1px solid #ee9999', padding: '8px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Add Player</div>

      <Row>
        <Label>Roster:</Label>
        <Select value={player.roster} onChange={e => set('roster', e.target.value)}>
          <option value="">—</option>
          {ROSTERS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      </Row>

      <Row>
        <Label>Name:</Label>
        <TextInput
          value={player.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Player name"
        />
      </Row>

      <Row>
        <Label>Pos:</Label>
        <Select value={player.pos} onChange={e => set('pos', e.target.value)}>
          <option value="">—</option>
          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
      </Row>

      <Row>
        <Label>Team:</Label>
        <Select value={player.team} onChange={e => set('team', e.target.value)}>
          <option value="">—</option>
          {AL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Row>

      <Row>
        <Label>Status:</Label>
        <Select value={player.status} onChange={e => set('status', e.target.value)}>
          <option value="regular">regular</option>
          <option value="prospect">prospect</option>
          <option value="protected">protected</option>
        </Select>
      </Row>

      <Row>
        <Label>MLB ID:</Label>
        <TextInput
          value={player.playerId || ''}
          onChange={e => set('playerId', e.target.value)}
          placeholder="0 if unknown"
          style={{ width: 80 }}
        />
        <span style={{ fontSize: 10, color: '#888', marginLeft: 6 }}>
          (map later via Player Mapper if unknown)
        </span>
      </Row>

      {validationMsg && <ValidationMsg>{validationMsg}</ValidationMsg>}
      {successMsg && <SuccessMsg>{successMsg}</SuccessMsg>}

      <SaveBtn onClick={onSave}>Add Player</SaveBtn>
    </div>
  );
};
