pragma ton-solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

contract YlideMailerV2 {

    event MailPush(address sender, uint256 msgId, bytes key);
    event MailContent(address sender, uint256 msgId, uint16 parts, uint16 partIdx, bytes content);

    constructor() public {
        require(tvm.pubkey() != 0, 101);
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
    }

    function buildHash(uint256 pubkey, uint32 uniqueId, uint32 time) public pure returns (uint256 _hash) {
        // _bytes = new bytes(40);
        // assembly { mstore(add(_bytes, 32), pubkey) }
        // assembly { mstore(add(_bytes, 36), uniqueId) }
        // assembly { mstore(add(_bytes, 40), time) }
        // _hash = sha256(_bytes))
        _hash = sha256(bytes(bytes32(pubkey * uniqueId * time)));
    }

    // Virtual function for initializing bulk message sending
    function getMsgId(uint32 uniqueId) public pure returns (uint256 msgId, uint32 initTime) {
        initTime = msg.createdAt;
        msgId = buildHash(msg.pubkey(), uniqueId, initTime);
    }

    // Send part of the long message
    function sendMultipartMailPart(uint32 uniqueId, uint32 initTime, uint16 parts, uint16 partIdx, bytes content) public pure {
        tvm.rawReserve(1 ton, 0);

        require(msg.createdAt >= initTime, 103);
        require(msg.createdAt - initTime >= 10 minutes, 104);

        uint256 msgId = buildHash(msg.pubkey(), uniqueId, initTime);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, parts, partIdx, content);

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    // Add recipient keys to some message
    function addRecipients(uint32 uniqueId, uint32 initTime, address[] recipients, bytes[] keys) public pure {
        tvm.rawReserve(1 ton, 0);

        uint256 msgId = buildHash(msg.pubkey(), uniqueId, initTime);
        
        for (uint i = 0; i < recipients.length; i++) {
            address recipientAddr = address.makeAddrExtern(recipients[i].value, 256);
            emit MailPush{dest: recipientAddr}(msg.sender, msgId, keys[i]);
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function sendSmallMail(uint32 uniqueId, address recipient, bytes key, bytes content) public pure {
        tvm.rawReserve(1 ton, 0);

        uint256 msgId = buildHash(msg.pubkey(), uniqueId, msg.createdAt);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);
        address recipientAddr = address.makeAddrExtern(recipient.value, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, 1, 1, content);
        emit MailPush{dest: recipientAddr}(msg.sender, msgId, key);

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function sendBulkMail(uint32 uniqueId, address[] recipients, bytes[] keys, bytes content) public pure {
        tvm.rawReserve(1 ton, 0);

        uint256 msgId = buildHash(msg.pubkey(), uniqueId, msg.createdAt);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, 1, 1, content);

        for (uint i = 0; i < recipients.length; i++) {
            address recipientAddr = address.makeAddrExtern(recipients[i].value, 256);
            emit MailPush{dest: recipientAddr}(msg.sender, msgId, keys[i]);
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }
}