pragma ever-solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

contract YlideMailerV3 {

    event MailPush(address sender, uint256 msgId, bytes key);
    event MailContent(address sender, uint256 msgId, uint16 parts, uint16 partIdx, bytes content);

    constructor() public {
        require(tvm.pubkey() != 0, 101);
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
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
    function sendMultipartMailPart(uint256 publicKey, uint32 uniqueId, uint32 initTime, uint16 parts, uint16 partIdx, bytes content) public pure {
        tvm.rawReserve(1 ton, 0);

        require(msg.createdAt >= initTime, 103);
        require(msg.createdAt - initTime >= 10 minutes, 104);

        uint256 msgId = buildHash(publicKey, uniqueId, initTime);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, parts, partIdx, content);

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    // Add recipient keys to some message
    function addRecipients(uint256 publicKey, uint32 uniqueId, uint32 initTime, address[] recipients, bytes[] keys) public pure {
        tvm.rawReserve(1 ton, 0);

        uint256 msgId = buildHash(publicKey, uniqueId, initTime);
        
        for (uint i = 0; i < recipients.length; i++) {
            address recipientAddr = address.makeAddrExtern(recipients[i].value, 256);
            emit MailPush{dest: recipientAddr}(msg.sender, msgId, keys[i]);
        }

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function sendSmallMail(uint256 publicKey, uint32 uniqueId, address recipient, bytes key, bytes content) public pure {
        tvm.rawReserve(1 ton, 0);

        uint256 msgId = buildHash(publicKey, uniqueId, msg.createdAt);

        // For indexation purposes
        address fakeContentAddr = address.makeAddrExtern(msgId, 256);
        address recipientAddr = address.makeAddrExtern(recipient.value, 256);

        emit MailContent{dest: fakeContentAddr}(msg.sender, msgId, 1, 1, content);
        emit MailPush{dest: recipientAddr}(msg.sender, msgId, key);

        msg.sender.transfer({ value: 0, flag: 128, bounce: false });
    }

    function sendBulkMail(uint256 publicKey, uint32 uniqueId, address[] recipients, bytes[] keys, bytes content) public pure {
        tvm.rawReserve(1 ton, 0);

        uint256 msgId = buildHash(publicKey, uniqueId, msg.createdAt);

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