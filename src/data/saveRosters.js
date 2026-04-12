export const saveRosters = (rosterData) => {
  let post = {};
  if (!rosterData) {
    return;
  }
  if (rosterData && rosterData.bashers && rosterData.stallions) {
    return fetch('http://localhost:2025/api/rosters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify(rosterData) 
    })
    .then(response => response.json())
    .then(data => {
      console.log('post Success save rosters');
      return ({status: 200, message: 'success save rosters'});
    })
    .catch((error) => {
      console.error('save rosters Error:', error);      
      return ({status: 500, message: `bad save rosters ${error}`});
    });
  }
}

