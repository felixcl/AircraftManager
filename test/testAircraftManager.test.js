let catchRevert = require("./exceptionsHelpers.js").catchRevert
const AircraftManager = artifacts.require("AircraftManager");

contract("AircraftManager", (accounts) => {
 let acmanager;

 before(async () => {
     acmanager = await AircraftManager.new("CC-ABC", 150, 10000);
 });

 describe("adding a coowner and adding flight hours", async () => {
    before("add coowner account[1] from account[0]", async () => {
      await acmanager.addCoOwner(accounts[1], { from: accounts[0] })
    });
   
    it("coowner can add a flight hour", async () => {
      const loghours = await acmanager.logFlightHours(1, "My flight", { from: accounts[1], value: 20000 })
      
      const logFlightHours = loghours.logs[0].args.flightHours.toNumber()
      
      assert.equal(logFlightHours,1, "The co-owner could not add a flight.");
    });

    it("not coowner cannot add flight hour", async () => {
      await catchRevert(acmanager.logFlightHours(1, "My flight", { from: accounts[2], value: 20000 })) 
      });

    it("update price per hour", async () => {
      await acmanager.updatePrice(150000, { from: accounts[0] });
      const newPrice = await acmanager.pricePerHour();
      assert.equal(newPrice,150000,"Price not updated correctly.")

      });
   });

describe("sending and returning from mechanic", async () => {
  before("send to mechanic account[2] from account[0]", async () => {
    await acmanager.sendToMechanic(accounts[3], 500, { from: accounts[0] });    
  });
 
  it("aircraft status is Mechanic", async () => {
    const status = await acmanager.aircraftStatus();
    assert.equal(status, 1, "The aircraft is not in maintenance after sending to mechanic.");
  });

  it("mechanic can return aircraft", async () => {
    const st = await acmanager.ReceiveFromMechanic.call(100, { from: accounts[3] }); 
    assert.equal(st,true, "Mechanic cannot return aircraft.");
     });

  it("mechanic cannot return aircraft charging over max", async () => {
      const st = acmanager.ReceiveFromMechanic(1000, { from: accounts[3] }); 
      await catchRevert(st);
    });

  it("coowner cannot return aircraft", async () => {
      const st = acmanager.ReceiveFromMechanic(100, { from: accounts[1] }); 
      await catchRevert(st);
    });
     
 });

});
