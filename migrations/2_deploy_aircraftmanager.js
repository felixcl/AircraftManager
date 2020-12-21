var AircraftManager = artifacts.require('AircraftManager');

module.exports = function(deployer) {
    deployer.deploy(AircraftManager, "CC-ABC", 150, 10000);
};