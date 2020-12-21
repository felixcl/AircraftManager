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
      var AircraftManager = data;
      App.contracts.AircraftManager = TruffleContract(AircraftManagerArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
      
      // Load information
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
      vu.wallet = accounts[0];
      App.GetTailNumber();
      // Use our contract to retrieve flight hours
      return App.GetFlightHours();
    });
    //return App.bindEvents();
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
    vu.hours = hours
  
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

  logFlightHour: function(event) {
    event.preventDefault();

    var flighthour = parseInt($(event.target).data('id'));

    var aircraftManagerInstance;

web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];

  App.contracts.AircraftManager.deployed().then(function(instance) {
    aircraftManagerInstance = instance;

    // Execute adopt as a transaction by sending account
    return adoptionInstance.adopt(petId, {from: account});
  }).then(function(result) {
    return App.markAdopted();
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
