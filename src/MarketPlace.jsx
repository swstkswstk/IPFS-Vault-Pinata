import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function MarketPlace() {
  const contractAddress = "0x1c54928c269b3af50aada0ba99e9911cc1579ce3";

  const contractABI = [
    // ... (same ABI you posted)
    { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "listItem", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "purchaseItem", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "address", "name": "_to", "type": "address" }], "name": "transferItem", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getItemsByOwner", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "itemCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "items", "outputs": [
        { "internalType": "uint256", "name": "id", "type": "uint256" },
        { "internalType": "string", "name": "name", "type": "string" },
        { "internalType": "uint256", "name": "price", "type": "uint256" },
        { "internalType": "address payable", "name": "seller", "type": "address" },
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "bool", "name": "isSold", "type": "bool" }
      ], "stateMutability": "view", "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ], "name": "ownedItems", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function"
    }
  ];

  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [items, setItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const signer = provider.getSigner();
      setSigner(signer);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);

      loadItems(contract);
      loadOwnedItems(contract, accounts[0]);

      window.ethereum.on("accountsChanged", async (accounts) => {
        setAccount(accounts[0]);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setSigner(signer);
        setContract(contract);
        loadItems(contract);
        loadOwnedItems(contract, accounts[0]);
      });
    };

    init();
  }, []);

  const loadItems = async (contract) => {
    const itemCount = await contract.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await contract.items(i);
      items.push(item);
    }
    setItems(items);
  };

  const loadOwnedItems = async (contract, owner) => {
    const ownedItemsIDs = await contract.getItemsByOwner(owner);
    let ownedItems = [];
    for (let id of ownedItemsIDs) {
      const item = await contract.items(id);
      ownedItems.push(item);
    }
    setOwnedItems(ownedItems);
  };

  const listItem = async () => {
    if (!contract) return console.error("Contract not loaded yet.");
    try {
      const tx = await contract.listItem(itemName, ethers.utils.parseEther(itemPrice));
      await tx.wait();
      loadItems(contract);
      setItemName("");
      setItemPrice("");
    } catch (error) {
      console.error("Error listing item:", error);
    }
  };

  const purchaseItem = async (id, price) => {
    try {
      const tx = await contract.purchaseItem(id, { value: ethers.utils.parseEther(price) });
      await tx.wait();
      loadItems(contract);
      loadOwnedItems(contract, account);
    } catch (error) {
      console.error("Error purchasing item:", error);
    }
  };

  const transferItem = async (id, toAccount) => {
    try {
      const tx = await contract.transferItem(id, toAccount);
      await tx.wait();
      loadItems(contract);
      loadOwnedItems(contract, account);
    } catch (error) {
      console.error("Error transferring item:", error);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Marketplace</h1>

      {/* List New Item Section */}
      <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl mb-4">List New Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none"
        />
        <input
          type="text"
          placeholder="Item Price (in ETH)"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="w-full p-3 mb-6 bg-gray-700 text-white rounded-lg focus:outline-none"
        />
        <button
          onClick={listItem}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          List Item
        </button>
      </div>

      {/* Items for Sale Section */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-3xl mb-6">Items for Sale</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <p><span className="font-bold">Name:</span> {item.name}</p>
              <p><span className="font-bold">Price:</span> {ethers.utils.formatEther(item.price)} ETH</p>
              <p><span className="font-bold">Owner:</span> {item.owner}</p>
              {!item.isSold && item.owner.toLowerCase() !== account.toLowerCase() && (
                <button
                  onClick={() => purchaseItem(item.id, ethers.utils.formatEther(item.price))}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 p-2 rounded-lg font-semibold"
                >
                  Purchase
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Owned Items Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-3xl mb-6">Your Owned Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ownedItems.map((item) => (
            <div key={item.id} className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <p><span className="font-bold">Name:</span> {item.name}</p>
              <p><span className="font-bold">Price:</span> {ethers.utils.formatEther(item.price)} ETH</p>
              <p><span className="font-bold">Owner:</span> {item.owner}</p>
              <input
                type="text"
                id={`transferAddress${item.id}`}
                placeholder="Transfer Address"
                className="w-full p-2 my-3 bg-gray-700 text-white rounded-lg focus:outline-none"
              />
              <button
                onClick={() => transferItem(item.id, document.getElementById(`transferAddress${item.id}`).value)}
                className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded-lg font-semibold"
              >
                Transfer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
