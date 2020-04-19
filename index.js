const fetch = require('node-fetch');
const ipfs = require('ipfs');
const { urlSource } = ipfs;

var node;

async function start() {
  node = await ipfs.create({"repo": ".cache"});
  refresh();
}

function refresh() {
  fetch('https://linux.exchange/distros.json')
    .then(res => res.json())
    .then(json => updateRepo(json));
}

async function updateRepo(distros) {

  let timeInBase64 = new Buffer(new Date().getTime().toString()).toString('base64');
  let versions = distros.distros.map(distro => distro['versions']).flat();

  await node.repo.gc();

  let newHashes = versions.map(version => version['ipfs-hash']);
  let hashesAlreadyThere = [];
  for await (const hash of node.pin.ls({"type": "recursive"})) {
    hashesAlreadyThere.push(hash.cid.toString());
  };
  
  var toRemove = hashesAlreadyThere.diff(newHashes);
  let toAdd = newHashes.diff(hashesAlreadyThere);

  for (let i of toRemove) {
    removeFile(toRemove[i]);
  }

  for (let hash of toAdd) {
    let version = versions.find(a => a['ipfs-hash'] == hash);
    addFile(version['direct-download-url'].replace('{{base64time}}', timeInBase64));
  }

  setInterval(refresh, 30 * 60 * 1000);

}

async function addFile(url) {
  try {
    for await (const file of node.add(urlSource(url, {"headers": {"user-agent": "Wget/"}}))) {
      console.log("Added " + url.substring(url.lastIndexOf('/') + 1));
      return;
    }
  }
  catch(e) {
    console.error('Problem downloading: ' + e.toString());
  }
}

async function removeFile(hash) {
  try {
    await node.pin.rm(hash);
    await node.repo.gc();
    console.log("Removed " + hash);
  }
  catch(e) {
    console.error('Problem removing: ' + e.toString());
  }
}

// https://stackoverflow.com/a/4026828/2700296
Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

start();