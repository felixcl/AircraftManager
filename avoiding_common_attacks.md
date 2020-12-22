To protect from reentrancy, all transactions are completed after setting the state, and the contract can only be accesed by people authorized by the owner. 
The owner can also remove authorization to anyone at any moment.

To protect from Transaction Ordering and Timestamp Dependence, nothing in the contract is time-dependant. We use now for the logs, but the important information is the day, so small 
variations in time related to mining time differences are not important for the logged information.

To protect from Integer Overflow and Underflow (SWC-101), Safemath library is used in all arithmetic operations.

To protect from Denial of Service with Failed Call, the owner can also move the aircraft to Active status to avoid an evil maintenance contract that does not allow the aircraft to return to service.
There are no other points in the code that could have a failed call.

To protect against Denial of Service by Block Gas Limit, all dynamic arrays where replaced with mappings. The only dynamic array present in the code is used for a call, there is no code looping an indefinite array.

To protect against Force Sending Ether, there is no logic that depends on the balance being a specific number, and there is also code implemented to receive ether in case there is a transfer

