pragma ever-solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import './Owned.sol';

contract YlideMailerV5 is Owned {

    uint128 public contentPartFee = 0;
    uint128 public recipientFee = 0;
    address public static beneficiary;

    event MailPush(address sender, uint256 msgId, bytes key);
    event MailContent(address sender, uint256 msgId, uint16 parts, uint16 partIdx, bytes content);
    event MailBroadcast(uint256 msgId);

    constructor() public {
        require(tvm.pubkey() != 0, 101);
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
    }

    function setFees(uint128 _contentPartFee, uint128 _recipientFee) public onlyOwner {
        contentPartFee = _contentPartFee;
        recipientFee = _recipientFee;
    }

    function setBeneficiary(address _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function buildHash(uint256 pubkey, uint32 uniqueId, uint32 time) public pure returns (uint256 _hash) {
        bytes data = bytes(bytes32(pubkey));
        data.append(bytes(bytes4(uniqueId)));
        data.append(bytes(bytes4(time)));
        _hash = sha256(data);
    }

    // Virtual function for initializing bulk message sending
    function getMsgId(uint256 publicKey, uint32 uniqueId, uint32 initTime) public pure returns (uint256 msgId) {
        msgId = buildHash(publicKey, uniqueId, initTime);
    }

    // Send part of the long message
    function sendMultipartMailPart(uint32 uniqueId, uint32 initTime, uint16 parts, uint16 partIdx, bytes content) public view {
        require(msg.createdAt >= initTime, 103);
        require(msg.createdAt - initTime <= 600, 104);

        uint256 msgId = buildHash(msg.pubkey(), uniqueId, initTime);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, parts, partIdx, content);

        if (contentPartFee > 0) {
            beneficiary.transfer({ value: contentPartFee, bounce: false });
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    // Add recipient keys to some message
    function addRecipients(uint32 uniqueId, uint32 initTime, address[] recipients, bytes[] keys) public view {
        uint256 msgId = buildHash(msg.pubkey(), uniqueId, initTime);
        
        for (uint i = 0; i < recipients.length; i++) {
            address recipientAddr = address.makeAddrExtern(recipients[i].value, 256);
            emit MailPush{dest: recipientAddr}(msg.sender, msgId, keys[i]);
        }

        if (recipientFee * recipients.length > 0) {
            beneficiary.transfer({ value: uint128(recipientFee * recipients.length), bounce: false });
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function sendSmallMail(uint32 uniqueId, address recipient, bytes key, bytes content) public view {
        uint256 msgId = buildHash(msg.pubkey(), uniqueId, msg.createdAt);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);
        address recipientAddr = address.makeAddrExtern(recipient.value, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, 1, 0, content);
        emit MailPush{dest: recipientAddr}(msg.sender, msgId, key);

        if (contentPartFee + recipientFee > 0) {
            beneficiary.transfer({ value: uint128(contentPartFee + recipientFee), bounce: false });
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function sendBulkMail(uint32 uniqueId, address[] recipients, bytes[] keys, bytes content) public view {
        uint256 msgId = buildHash(msg.pubkey(), uniqueId, msg.createdAt);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, 1, 0, content);

        for (uint i = 0; i < recipients.length; i++) {
            address recipientAddr = address.makeAddrExtern(recipients[i].value, 256);
            emit MailPush{dest: recipientAddr}(msg.sender, msgId, keys[i]);
        }

        if (contentPartFee + recipientFee * recipients.length > 0) {
            beneficiary.transfer({ value: uint128(contentPartFee + recipientFee * recipients.length), bounce: false });
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function broadcastMail(uint32 uniqueId, bytes content) public view {
        uint256 msgId = buildHash(msg.pubkey(), uniqueId, msg.createdAt);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, 1, 0, content);
        emit MailBroadcast{dest: address.makeAddrExtern(msg.sender.value, 256)}(msgId);

        if (contentPartFee > 0) {
            beneficiary.transfer({ value: uint128(contentPartFee), bounce: false });
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function broadcastMailHeader(uint32 uniqueId, uint32 initTime) public pure {
        uint256 msgId = buildHash(msg.pubkey(), uniqueId, initTime);

        emit MailBroadcast{dest: address.makeAddrExtern(msg.sender.value, 256)}(msgId);

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }
}