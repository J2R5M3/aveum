// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// For a list of endpoint IDs and contract addresses, see:
// https://docs.layerzero.network/v2/deployments/deployed-contracts
import {OApp} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

contract SimpleOApp is OApp {
    string public message;

    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) {}

    function sendMessage(uint32 _dstEid, string calldata _message) external payable {
        bytes memory payload = abi.encode(_message);
        // This is a placeholder for options. In a real app, you would need to calculate this.
        bytes memory options = abi.encodePacked(uint256(200000));

        _lzSend(
            _dstEid,
            payload,
            options,
            IMessagingFee.Fee(msg.value, 0),
            payable(msg.sender)
        );
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32,
        bytes calldata _payload,
        address,
        bytes calldata
    ) internal override {
        message = abi.decode(_payload, (string));
    }
}
