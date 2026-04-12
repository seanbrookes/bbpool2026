const fs = require('fs');
/*

*/
export default async function(req, res) {

  if (req.method === 'POST') {
    const targetPost = req.body;
    const saveTimestamp = new Date().getTime();
    if (!targetPost) {
      return res.send({status: 400, message: 'not saved missing  body'});
    }
    /*
    write the file
    */
    fs.writeFile(`./src/data/rosters2025.json`, JSON.stringify(targetPost), err => { 
      if (err) throw err;  
    });
    fs.writeFile(`./bak/rosters2025-${saveTimestamp}.json`, JSON.stringify(targetPost), err => { 
          
      // Checking for errors 
      if (err) throw err;  
    
      console.log("Done writing"); // Success 
      
    });
    return res.send({status: 200, message: 'saved'});
  
  }
  if (req.method === 'GET') {
    const dir = './src/data/';
    let files;
    let returnError;
   // res.contentType('application/json');
    let rosterData = null;

    try {
      const data = fs.readFileSync('./src/data/rosters2025.json');

      rosterData = JSON.parse(data);
    } catch (err) {
      console.error('| bad rosters read json', err);
      returnError = err;
    }
  
    if (returnError) {
      res.status(500)
      return res.send({error: returnError.message});
    }
    else {
      return res.send(JSON.stringify(rosterData));
    }    
  }
  
}
