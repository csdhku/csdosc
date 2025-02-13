/*
 * Deze code is geschreven door Roald van Dillewijn voor de sysbas-lessen op de HKU-opleiding Muziektechnologie. 
 * Bijdragen door Nathan Marcus, Jochem van Iterson, Geert Roks en Marc Groenewegen
 * Deze code mag je opnieuw gebruiken en aanpassen. Vermeld dan wel even van wie je de code hebt. 
 */

const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const osc = require('node-osc');
const readline = require('readline');
const fs = require('fs');
const http = require('http');
const https = require('https');
const _ = require('lodash');
const os = require('os');

let sendSocket = [];
let oscServer = [];
let oscClient = [];
let clients = {};


/*--------------osc-----------------/
 *-----------functions--------------/
 *///-------------------------------/

//check if a server is already running on the desired port, if so: kill it first
function serverExist(port,id,callback) {
  let found = 0;
  for (let i in oscServer) {
    if (oscServer[i] && oscServer[i].port == port) {
      found = 1;
      oscServer[i].close();
      oscServer[i] = null;
      callback();  
    }
  }
  if (!found) {
    callback();  
  }
}

/*--------user-interaction----------/
 *----------exit-program------------/
 *///-------------------------------/

//handle ctrl+c 
process.on('SIGINT', function(){
  killOsc();
  process.exit (0);
});

//get user input from the terminal
const rl = readline.createInterface({
  input: process.stdin
});

//check the code that is given by the user. 
rl.on('line', (input) => {
  //quit the program when one of these words is used.
  if (input == "quit" || input == "stop" || input == "hou op!") {
    killOsc();
    process.exit(0);
  }
  //start the update process 
  if (input == "update") {
    requestUpdate();
  }
});

async function requestUpdate() {
  await downloadFile('https://csd.hku.nl/sysbas/csdoscHelper/updateState.txt','./.updateState.txt')
  .then(getUpdateState)
  .then(downloadFile('https://csd.hku.nl/sysbas/csdoscHelper/filesToUpdate.txt','./.filesToUpdate.txt'))
  .then(startUpdate)
  .then(doUpdate)
  .then(updateSucces).catch(error => {
    console.log(error);
  });
}

// close any of the available OSC instances, client and servers.
function killOsc() {
  oscServer.forEach(s => {
    if (s)s.close();
  });
  oscClient.forEach(s => {
    if (s)s.close();
  });
}

/*-----------http-server------------/
 *----------------------------------/
 *///-------------------------------/

/*
 * Genereer een (mooie) landings-pagina, code door Jochem van Iterson
 * @param {String} body Content to be inserted into the page
 * @returns {String} The HTML output
 */
function printPage (body) {
  return `
  <html>
    <head>
      <title>Welkom bij de csdosc startpagina!</title>
      <link rel="stylesheet" href="/Library/style.css" />
    </head>
    <body>${body}</body>
  </html>`;
};

/*
 * Genereer een lijst met de inhoud van de folder
 * @param {String} folderPath path to be shown
 * @param {Object} options options for the list generation
 * @returns {String} The HTML output
 */

function generateFileList (folderPath, options = {}) {
  const stats = fs.statSync(folderPath);
  const ignorableNames = [
    // Directories
    /.git$/,
    /^\/node_modules$/,
    /^\/Library$/,
    
    // Files in root
    /^\/.filesToUpdate.txt$/,
    /^\/.lastUpdate.txt$/,
    /^\/.updateState.txt$/,
    /^\/LICENSE$/,
    /^\/README.md$/,
    /^\/favicon.ico$/,
    /^\/oscServer.js$/,
    /^\/oscLib.js$/,
    /^\/package(-lock)?.json$/,
    
    // Files from all directories
    /.DS_Store$/,
    /.gitignore$/,
  ];
  
  const showHidden = options.showHidden || false;
  const showFiles = options.showFiles || false;

  // Check if current folder is the root path (with fix for trailing '/')
  const isRoot = path.join(folderPath, '/.') == path.join(__dirname, '/.')

  // Return if the requested path is not a directory
  if (!stats.isDirectory()) return '';
    
  // Get folder content, filter out ignorable files using regex
  const folderContent = fs.readdirSync(folderPath, { withFileTypes: true }).filter((e) => {
    const filePath = path.join(folderPath, e.name).replace(__dirname, '')
    for (const ignorableName of ignorableNames) {
      if (ignorableName.test(filePath)) return false
    }
    return true
  })
  
  // Map array to more useful data
  const mappedContent = folderContent.map((e)=>{
    const filePath = path.join(folderPath, e.name)
    const fileStats = fs.statSync(filePath);
    return {
      name: e.name,
      path: filePath,
      extension: path.extname(filePath).replace('.', ''),
      isDirectory: fileStats.isDirectory(),
      isHidden: (/(^|\/)\.[^\/\.]/g).test(e.name)
    }
  });

  // Filter out files if needed
  const filteredContent = mappedContent.filter((e) => {
    return (showHidden || !e.isHidden) && (showFiles || e.isDirectory);
  });

  // Add parent directory link if not root
  if (!isRoot) {
    filteredContent.unshift({
      name: "..",
      path: path.join(folderPath, ".."),
      extension: "",
      isDirectory: true,
      isHidden: false,
    });
  }
  
  // Generate HTML
  const tableRows = filteredContent.map((e) => `<tr class="entryRow" onclick="window.location='${ e.name }';"><td>${ e.name }</td></tr>`).join('\n');

  // Create a clickable table with the content of the folder
  return `
    <table class="folderTable card">
    <tr><th>Directory name</th></tr>
    ${tableRows}
    </table>`;
}

//start the server listening on port 8001
server.listen(8001,function() {
  console.log("De server staat aan! Je kunt deze via localhost:8001 bereiken.\nJe kunt dit programma afsluiten door stop+enter te typen");
  
  if (os.release().includes('WSL2')) {
    // Achterhaal het IP adres dat gebruikt kan worden om vanuit Windows OSC berichten naar deze WSL server te sturen.
    let addresses = os.networkInterfaces()['eth0'];
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].family === 'IPv4') {
        console.log("De server kan OSC berichten ontvangen op " + addresses[i].address);
      }
    }
  }
});

//zorg dat de server alle paths kan bereiken. 
app.use(express.static(path.join(__dirname,'/')));

/*---------------pages--------------/
 *----------------------------------/
 *///-------------------------------/
 app.use(function(req,res,next) {
  const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  const filePath = path.join(__dirname, req.originalUrl)
  const exists = fs.existsSync(filePath)
  let response = ''
  let httpStatus = 200

  // Generate error message if file does not exist
  if (!exists) {
    response = `<div class="card padding text-center">
      <h2>Error!</h2><br>
      De pagina <b>${fullUrl}</b> bestaat niet, heb je het goede adres ingevuld?
    </div>`;
    httpStatus = 404
  }  

  else {
    const fileList = generateFileList(filePath, {
      showHidden: false,
      showFiles: false,
    });

    // Show a welcome message if folder is root
    if (req.originalUrl === "/") {
      response = `<div class="card padding text-center">
        Welkom bij de csdosc-startpagina!<br><br>
        Voor meer informatie over het gebruik van deze library ga je naar <a href="https://csd.hku.nl/sysbas2324" target="_blank">csd.hku.nl/sysbas2324</a>
      </div>${fileList}`;
    } else {
      response = `<div class="card padding">Inhoud van de folder: <b>${fullUrl}</b></div>${fileList}`;
    }
  }
  if (response !== '') res.status(httpStatus).send(printPage(response));
  else next();
})

/*----------web-socket--------------/
 *----------------------------------/
 *///-------------------------------/

io.on('connection', function (socket) {
  clients[socket.id] = socket;  
  
  //initialize socket, make a connection with the webpage
  socket.on('oscLib',function(data) {
    sendSocket[data] = clients[data];
    let returnMessage = setTimeout(function() {
      sendSocket[data].emit("connected",data);
    },100);

    //what to do on disconnecting
    sendSocket[data].on('disconnect',function() { 
      //close the OSC-port. 
      if (data && oscServer[data]) {
        oscServer[data].close();
        oscServer[data] = null;
      }
    });
  });

  //on receiving start message for server
  socket.on('startServer',function(data) {
    serverExist(data.port,data.id,function() {
      oscServer[data.id] = new osc.Server(data.port,'0.0.0.0');

      sendSocket[data.id].emit("serverRunning",{"port":data.port});
        
      oscServer[data.id].on("message",function([...msg],rinfo) {
        let address = msg.shift();
        let message = msg;
        let sendData = {"add":address,"msg":message};
        sendSocket[data.id].emit('getMessage',sendData);
      });
    });
  });

  //on receiving kill message for server
  socket.on('killServer',function() {
    oscServer.close();
  });

  //on receiving start message for client
  socket.on('startClient',function(data) {  
    // In WSL1 Linux syscalls (such as networking) are translated to Windows syscalls. Using localhost should work to reach WSL and Windows programs.
    // In WSL2 however Linux actually runs inside a Virtual Machine and therefore has a different localhost as the Windows localhost.
    if (os.release().includes('WSL2') && data.ip === 'localhost-windows') {
      // User is running from inside WSL2 and wants to send to an OSC server running in Windows (such as Max/MSP)
      // Use the mDNS setup by Windows that resolves to the Windows localhost address
      // Source for solution: https://stackoverflow.com/a/69407064
      data.ip = os.hostname() + '.local';
    }

    oscClient[data.id+data.port] = new osc.Client(data.ip, data.port);
    sendSocket[data.id].emit("clientRunning",{"ip":data.ip,"port":data.port,"active":1});
  });

  //on receiving kill message for client
  socket.on('killClient',function() {
    oscClient.close();
  });

  //on receiving message to send
  socket.on('sendMessage',function(data) {
    if (oscClient[data.id+data.port]) {
      oscClient[data.id+data.port].send(data.address, data.message, function () {
      });  
    }
  });
});


//all the functions for updating this code.
async function downloadFile(url, filePath) {
  const proto = !url.charAt(4).localeCompare('s') ? https : http;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    let fileInfo = null;

    const request = proto.get(url, response => {
      if (response.statusCode !== 200) {
        reject(`Failed to get '${url}' (${response.statusCode})`);
        return;
      }

      fileInfo = {
        mime: response.headers['content-type'],
        size: parseInt(response.headers['content-length'], 10),
      };

      response.pipe(file);
    });

    // The destination stream is ended by the time it's called
    file.on('finish', () => resolve(fileInfo));

    request.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });

    file.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });

    request.end();
  });
}

async function getUpdateState() {
  return new Promise((resolve, reject) => {
    fs.readFile('./.lastUpdate.txt','utf8', (err,lastDay) => {
      if (err)reject ("er ging iets fout...");
      let lastUpdate = new Date(lastDay);
      fs.readFile('./.updateState.txt', 'utf8', (err,data) => {
        if (err) {
          reject(`can't read update file`);
        }
        else {
          newestUpdate = new Date(data.replace(/(\r\n|\n|\r)/gm,""));
          if (lastUpdate < newestUpdate) {
            resolve();
          }
          else {
            reject("Er is op dit moment geen update beschikbaar");
          }
        }
      });
    })
  })  
}

async function startUpdate() {
  return new Promise((resolve,reject) => {
    fs.readFile('./.filesToUpdate.txt','utf8',(err,data) => {
      if (err) {
        reject(`no files found to update`)
      } else {
        let updateList = data.split("\n")
        resolve(updateList);
      }
    })
  });
}

async function doUpdate(list) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i] !== '') {
        //check if this file is in a folder, if it does not exist yet, make it
        let folder = list[i].split("/")[0]; //get the folder
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }
        await downloadFile('https://csd.hku.nl/sysbas/csdoscHelper/csdosc/'+list[i],list[i])
        .catch( error => {
          reject(error);
        })
      }
    }
    resolve("De update is geslaagd! Dit programma zal nu worden afgesloten, start het daarna opnieuw op door npm start te typen");
  });
}

async function updateSucces(result) {
  let today = formatDate();
  fs.writeFile('./.lastUpdate.txt',today,'utf8',error => {
    if (error)console.log(error);
    console.log(result);  
    killOsc()
    process.exit(0);
  });
  
}

function formatDate() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}
