Some design decisions are:
Simplicity, only save the minumum amount of data we need.
Save complete text instead of hash, because text content is important in aviation logs
Each aircraft has its own contract, because we are not running as a registry and each aircraft and owner are independent entities
The contract is monolithic because it is a relatively small contract, to avoid the complexity of inter-contract interaction. We could have a different contract
for the mechanic and for pilot logs, but they are currently part of the same smart contract.

The design patterns being implemented are:
- Fail early and loud (use of require before running functions)
- Restricting access: Only owner can run certain functions, only co-owners (pilots) can log hours and only assigned mechanic or owner can put aircraft back in service.
- Mortal: The contract has a self-destruction method that can only be called by the owner after setting the emergency state through the circuit breaker pattern.
- Circuit breaker: Implemented with the use of breaker state variable and modifiers stopEmergency and onlyEmergency
- State machine: Moves from Active status to Maintenance status, in maintenance you cannot add flight hours.

