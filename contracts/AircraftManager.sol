// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

/// @title Aircraft Management smart contract for aircraft logs and maintenance
/// @author Felix Halcartegaray
/// @notice This contract allows to manage co-owners, log and pay their flight hours and log maintenance and pay to the mechanic.
/// @dev The contract implements basic transactions, assumes co-owners are also pilots and no flights happen outside the contract

contract AircraftManager {
  using SafeMath for uint256;
  /// @notice The TailNumber is the identification of the aircraft, a unique identifier worldwide (in the US also known as N-number)
  string public tailNumber;
  /// @notice Price to pay per hour of flight
  uint public pricePerHour;
  address payable owner;
  /// @notice Total flight hours of this aircraft
  uint public flightHours;
  /// @notice All detailed flight activity for this aircraft
  FlightLog[] public log;
  // Store the current mechanic and maximum payment
  address payable mechanic;
  uint maxPayment;
  // Keep track of active co-Owners that can fly and flight hours per pilot
  mapping (address => bool) coOwner;
  mapping (address => uint) flightHoursPerPilot;
  /// @notice Indicates if the aircraft is ready to fly or in maintenance.
  /// @dev Currently has two status, but should have more (for example AOG, aircraft on ground)
  Status public aircraftStatus;
  /// @notice Used in case of needing to stop the contract
  /// @dev Used to implement the circuit breaker pattern
  bool public breaker = false;

  enum Status {Active, Maintenance}

  struct FlightLog {
    uint date;
    address pilot;
    uint flightHours;
    string comment;
  }
  event LogFlightHour(address pilot, uint flightHours, uint date);
  event LogMaintenance(address mechanic, uint date);


  modifier onlyOwner() { require (msg.sender == owner, "Only owner can call"); _;}
  modifier onlyCoOwner() { require (coOwner[msg.sender] == true, "Only coowner can log hours"); _;}
  modifier enoughPay(uint _flightHours) { require (msg.value >= (pricePerHour.mul(_flightHours)), "Not enough value"); _;}
  modifier refundExtraPayment(uint _flightHours) {
    _;    
    uint refundAmount = msg.value.sub(pricePerHour.mul(_flightHours));
    msg.sender.transfer(refundAmount);
  }
  modifier aircraftActive() {require(aircraftStatus == Status.Active); _;}
  modifier aircraftInMaintenance() {require(aircraftStatus == Status.Maintenance); _;}
  modifier stopEmergency() {require(!breaker); _;}
  modifier onlyEmergency() {require(breaker); _;}

  /// @notice Creates a new aircraft
  /// @param _tailNumber Stores the identification of the aircraft
  /// @param _initialHours Sets the initial number of hours for the aircraft (current number of hours)
  /// @param _pricePerHour Sets the price per hour to pay for each hour flown by pilots
  constructor(string memory _tailNumber, uint _initialHours, uint _pricePerHour) public {
    owner = msg.sender;
    coOwner[msg.sender] = true;
    tailNumber = _tailNumber;
    flightHours = _initialHours;
    pricePerHour = _pricePerHour;
  }

  /// @notice Adds a co-owner to the aircraft
  /// @param _coowner Indicate the address of the co-owner to add
  function addCoOwner(address payable _coowner) 
    external
    onlyOwner
    stopEmergency
  {
      coOwner[_coowner] = true;
  }

  /// @notice Removes a co-owner from the aircraft
  /// @param _coowner Indicate the address of the co-owner to remove
  function removeCoOwner(address payable _coowner) 
    external
    onlyOwner
    stopEmergency
  {
      coOwner[_coowner] = false;
  }

  /// @notice Updates the price per hour
  /// @param _newprice Indicates the new price per hour
  function updatePrice(uint _newprice) 
    external
    onlyOwner
  {
      pricePerHour = _newprice;
  }

  /// @notice Gets the balance of the aircraft
  /// @return Balance available for aircraft
  function getBalance() public view onlyCoOwner returns(uint) {
    return address(this).balance;
  }

  /// @notice Logs a new flight, using the sender as pilot, date as now. Can only be logged if aircraft is active.
  /// @param _flighthours Indicates the number of flight hours to log
  /// @param _comment Logs any comments on this flight
  /// @return True if the log was correctly recorded
    function logFlightHours(uint _flighthours, string calldata _comment) 
    public 
    payable
    stopEmergency 
    onlyCoOwner
    aircraftActive 
    enoughPay(_flighthours)
    refundExtraPayment(_flighthours)
    returns(bool)
    {
    log.push(FlightLog({date: now, pilot: msg.sender, flightHours: _flighthours, comment: _comment}));
    flightHours.add(_flighthours);
    flightHoursPerPilot[msg.sender].add(_flighthours);
    emit LogFlightHour(msg.sender, _flighthours, now);

    return true;
  }

  /// @notice Send the aircraft to the mechanic
  /// @param _mechanic Indicates the address of the mechanic that will serve the aircraft
  /// @param _maxPay Indicates maximum amount to pay for this service
  /// @return True if the change of state was correctly recorded
  function sendToMechanic(address payable _mechanic, uint _maxPay)
      external
      stopEmergency
      aircraftActive
      onlyOwner
      returns (bool)
    {
      emit LogMaintenance(_mechanic, now);
      mechanic = _mechanic;
      maxPayment = _maxPay;
      aircraftStatus = Status.Maintenance;
      return true;
    }

  /// @notice Update maximum payment for the mechanic
  /// @param _maxPay Indicates maximum amount to pay for this service
  function setMaxPayment(uint _maxPay)
      external
      onlyOwner
    {
      maxPayment = _maxPay;
    }
  
  /// @notice Receive the aircraft from the mechanic and pay for the service if it is below the allowed maximum
  /// @param _amount Indicates  amount to pay for this service
  /// @return True if the change of state was correctly recorded
  function ReceiveFromMechanic(uint _amount) external payable stopEmergency returns(bool) {
    // We allow owner to also receive from mechanic to avoid lock. First option is mechanic as it is the most likely (short circuit)
    require(_amount <= maxPayment, "Requested payment exceeds maximum set by owner");
    require(address(this).balance >= _amount, "Not enough balance to pay for the service.");
    require(msg.sender == mechanic || msg.sender == owner, "Can only be called by mechanic or owner");
    aircraftStatus = Status.Active;
    mechanic.transfer(_amount);
    return(true);
  }

  /// @notice Get the complete flight log
  /// @return Complete flight log of this aircraft
  function getFlightLog() public view returns(FlightLog[] memory) {
    return log;
  }

  /// @notice Toggle Breaker to set or stop emergency. Only owner can set it.
  /// @dev Toggles breaker for circuit breaker pattern
  function toggleEmergency() 
  public
  onlyOwner
  {
    breaker = !breaker;
  }

  /// @notice Destroy aircraft and return funds to owner
  function deleteAircraft() 
  public
  onlyEmergency
  onlyOwner
  {
    selfdestruct(owner);
  }

  /// @notice Allow to add funds if there is not enough
  receive() external payable { 
    // We just add the funds to the aircraft balance
  }

}
