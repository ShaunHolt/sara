// set start vars
var bootstrapactive = false;
var bootstraparray = [];

// include colored responses module
const response = require('./response.js');

// include fs module
const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);

function load (path) {
  return require(resolve(process.cwd(), path));
}

module.exports = {
  start: async function() {
    if (bootstrapactive == false) {
      response.conlog('bootstrap', 'bootstrapping activated', 'status');
      bootstrapactive = true;
      module.exports.bootstraprunner();
      result = 'I am now able to execute background plugins';
      return result;
    } else {
      response.conlog('bootstrap', 'bootstrapping is already activated', 'status');
      result = 'I am already able to execute background plugins';
      return result;
    }
  },
  list: tasklist,
  bootstraprunner: bootstraprunner,
  bootstrapstopper: bootstrapstopper,
  stop: async function() {
    if (bootstrapactive == true) {
      response.conlog('bootstrap', 'bootstrapping deactivated', 'status');
      bootstrapactive = false;
      module.exports.bootstrapstopper();
      result = 'I am no longer able to execute background plugins';
      return result;
    } else {
      response.conlog('bootstrap', 'bootstrapping is already deactivated', 'status');
      result = 'I am already not able to execute background plugins';
      return result;
    }
  },
  status: function() {
    return bootstrapactive;
  }
}

async function tasklist () {
  if (bootstraparray.length < 1) {
    result = 'There are no active bootstraps';
  } else {
    if (bootstraparray.length === 1) {
      result = 'There is '+bootstraparray.length+' active bootstrap:\n\t'+bootstraparray.join('\n\t');
    } else {
      result = 'There are '+bootstraparray.length+' active bootstraps:\n\t'+bootstraparray.join('\n\t');
    }
  }
  return result;
}

function bootstraprunner() {
  return new Promise(resolve => {
    (async function () {
      var bootstrapfound = false;
      const files = await readdir('bootstrap');
      const bootstraps = files
        .filter(file => file.endsWith('.js'));

      var i = 0;
      var amount = bootstraps.length;
      if (amount > 0) {
        bootstrapfound = true;
      }

      while (i < amount) {
        var bootstrapfile = require('./bootstrap/'+bootstraps[i])
        bootstrapfile.start();
        if (bootstrapfile.status()) {
          bootstraparray.push(bootstraps[i]);
        }
        i++;
      }

      if (bootstrapfound == false) {
        response.conlog('bootstrap', 'Couldn\'t find bootstrap files in ./bootstrap folder', 'error');
      }
    })().catch(err => {
      response.conlog('bootstrap', 'Couldn\'t scan bootstraps: '+err, 'error');
    });
  })  
}

function bootstrapstopper() {
  return new Promise(resolve => {
    (async function () {
      var bootstrapfound = false;
      const files = await readdir('bootstrap');
      const bootstraps = files
        .filter(file => file.endsWith('.js'));

      var i = 0;
      var amount = bootstraps.length;
      if (amount > 0) {
        bootstrapfound = true;
      }

      while (i < amount) {
        var bootstrapfile = require('./bootstrap/'+bootstraps[i])
        bootstrapfile.stop();
        if (!bootstrapfile.status()) {
          var index = bootstraparray.indexOf(bootstraps[i]);
          if (index > -1) {
            bootstraparray.splice(index, 1);
          }
        }
        i++;
      }

      if (bootstrapfound == false) {
        response.conlog('bootstrap', 'Couldn\'t find bootstrap files in ./bootstrap folder', 'error');
      }
    })().catch(err => {
      response.conlog('bootstrap', 'Couldn\'t scan bootstraps: '+err, 'error');
    });
  })  
}