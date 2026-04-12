
//const battersUrl = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2021&stats=season&group=hitting&gameType=R&limit=1000&offset=0&sortStat=onBasePlusSlugging&order=desc&playerPool=ALL_CURRENT&leagueIds=103";
const battersUrl = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2025&stats=season&group=hitting&gameType=R&limit=1000&offset=0&sortStat=onBasePlusSlugging&order=desc&playerPool=ALL_CURRENT";

const pitchersUrl = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2025&stats=season&group=pitching&gameType=R&limit=1000&offset=0&sortStat=earnedRunAverage&order=asc&playerPool=ALL_CURRENT";

export const getPitcherStats = async () => {
  return fetch(pitchersUrl)
    .then((response) => { 
    //  console.log(`|  response data  ${JSON.stringify(response)}`)
      //return response
      return response.json();
    })
    .then((data) => { 
      return data;
//      return console.log(`|  response data  ${JSON.stringify(data)}`)
    })
    .catch((err) => {
      return console.log(`|  ERROR     ${JSON.stringify(err)}`)
    });
};

export const getHitterStats = async () => {
  return fetch(battersUrl)
    .then((response) => { 
    //  console.log(`|  response data  ${JSON.stringify(response)}`)
      //return response
      return response.json();
    })
    .then((data) => { 
      return data;
//      return console.log(`|  response data  ${JSON.stringify(data)}`)
    })
    .catch((err) => {
      return console.log(`|  ERROR     ${JSON.stringify(err)}`)
    });
};