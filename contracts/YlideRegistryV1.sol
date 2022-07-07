pragma ever-solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

contract YlideRegistryV1 {

    event PublicKeyToAddress(address addr);
    event AddressToPublicKey(uint256 publicKey);

    constructor() public {
        require(tvm.pubkey() != 0, 101);
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
    }

    function attachPublicKey(uint256 publicKey) public pure {
        emit AddressToPublicKey{dest: msg.sender}(publicKey);
    }

    function attachAddress(uint256 publicKey) public pure {
        emit PublicKeyToAddress{dest: address.makeAddrExtern(publicKey, 256)}(msg.sender);
    }

}