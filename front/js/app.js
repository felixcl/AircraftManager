App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('AircraftManager.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AircraftManagerArtifact = data;
      App.contracts.AircraftManager = TruffleContract(AircraftManagerArtifact);
    
      // Set the provider for our contract
      App.contracts.AircraftManager.setProvider(App.web3Provider);
      
      // Load information
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
        vu.wallet = accounts[0];
      });
      App.GetTailNumber();
      App.GetPriceHour();
      App.GetState();
      // Use our contract to retrieve flight hours
      return App.GetFlightHours();
    //return App.bindEvents();
  })
  },

  //bindEvents: function() {
  //  $(document).on('click', '.btn-adopt', App.handleAdopt);
  //},

  GetFlightHours: function() {
    var aircraftManagerInstance;

  App.contracts.AircraftManager.deployed().then(function(instance) {
  aircraftManagerInstance = instance;

  return aircraftManagerInstance.flightHours.call();
}).then(function(_hours) {
    vu.hours = _hours;
  
}).catch(function(err) {
  console.log(err.message);
});

  },

  GetTailNumber: function() {
    var aircraftManagerInstance;

App.contracts.AircraftManager.deployed().then(function(instance) {
  aircraftManagerInstance = instance;

  return aircraftManagerInstance.tailNumber.call();
}).then(function(_tailnum) {
    vu.tailnumber = _tailnum;
  
}).catch(function(err) {
  console.log(err.message);
});

  },

  GetPriceHour: function() {
    var aircraftManagerInstance;

App.contracts.AircraftManager.deployed().then(function(instance) {
  aircraftManagerInstance = instance;

  return aircraftManagerInstance.pricePerHour.call();
}).then(function(_pricehour) {
    vu.pricehour = _pricehour;
  
}).catch(function(err) {
  console.log(err.message);
});

  },

  GetState: function() {
    var aircraftManagerInstance;

App.contracts.AircraftManager.deployed().then(function(instance) {
  aircraftManagerInstance = instance;

  return aircraftManagerInstance.aircraftStatus.call();
}).then(function(_acstate) {
    vu.acstate = _acstate;
  
}).catch(function(err) {
  console.log(err.message);
});

  },

  logFlightHour: function(_hours,_comment,_amount) {    

    var aircraftManagerInstance;

web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];
  //console.log("Data: "+account+" "+_hours+" "+_comment+" "+_amount)
  App.contracts.AircraftManager.deployed().then(function(instance) {
    aircraftManagerInstance = instance;

    // Execute log as a transaction by sending account and value
    return aircraftManagerInstance.logFlightHours(_hours, _comment, {from: account, value: _amount});
  }).then(function(result) {
    vu.hours=0;
    vu.commenttolog="";
    return App.GetFlightHours();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  },

changePricePerHour: function(_newprice) {    

  var aircraftManagerInstance;

web3.eth.getAccounts(function(error, accounts) {
if (error) {
  console.log(error);
}

var account = accounts[0];
App.contracts.AircraftManager.deployed().then(function(instance) {
  aircraftManagerInstance = instance;

  // Execute log as a transaction by sending account 
  return aircraftManagerInstance.updatePrice(_newprice, {from: account});
}).then(function(result) {
  vu.newprice = 0;
  return App.GetPriceHour();
}).catch(function(err) {
  console.log(err.message);
});
});

  },

  changecoowner: function(_address, _add) {    

    var aircraftManagerInstance;
  
  web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }
  
  var account = accounts[0];
  App.contracts.AircraftManager.deployed().then(function(instance) {
    aircraftManagerInstance = instance;
  
    // Execute log as a transaction by sending account 
    if(_add) return aircraftManagerInstance.addCoOwner(_address, {from: account});
    else return aircraftManagerInstance.removeCoOwner(_address, {from: account});
  }).then(function(result) {
    return;
  }).catch(function(err) {
    console.log(err.message);
  });
  });
  
    },

    sendMechanic: function(_mechanic, _maxpay) {    

      var aircraftManagerInstance;
    
    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }
    
    var account = accounts[0];
    App.contracts.AircraftManager.deployed().then(function(instance) {
      aircraftManagerInstance = instance;
    
      // Execute log as a transaction by sending account 
      return aircraftManagerInstance.sendToMechanic(_mechanic, _maxpay, {from: account});
    }).then(function(result) {
      vu.mecaddress = "";
      vu.maxpay = "";
      return App.GetState();
    }).catch(function(err) {
      console.log(err.message);
    });
    });
    
      },

      receiveMechanic: function(_amount) {    

        var aircraftManagerInstance;
      
      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      
      var account = accounts[0];
      App.contracts.AircraftManager.deployed().then(function(instance) {
        aircraftManagerInstance = instance;
      
        // Execute log as a transaction by sending account 
        return aircraftManagerInstance.ReceiveFromMechanic(_amount, {from: account});
      }).then(function(result) {
        vu.mecamount = "";
        return App.GetState();
      }).catch(function(err) {
        console.log(err.message);
      });
      });
      
        }




};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
