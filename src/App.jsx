import { useState } from "react";
import { pinata } from "./config";
import { ethers } from "ethers";

export default function App() {
  const contractAddress = "0x7792bacdf0fe60ee0068f06d4eba6a4ceb8a14e5";
  const contractABI = [
    {
      inputs: [{ internalType: "string", name: "_ipfshash", type: "string" }],
      name: "setIPFSHASH",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getIPFSHASH",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "ipfsHash",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [storedHash, setStoredHash] = useState("");

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    try {
      const response = await pinata.upload.file(selectedFile);
      setIpfsHash(response.IpfsHash);
      console.log("Uploaded:", response);
      await storedHashOnBlockchain(response.IpfsHash);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const storedHashOnBlockchain = async (hash) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.setIPFSHASH(hash);
    await tx.wait();
  };

  const retrieveHashFromBlockchain = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const storedHash = await contract.getIPFSHASH();
    setStoredHash(storedHash);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 py-8 text-white space-y-6">
      {/* Upload Card */}
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Upload to IPFS</h2>
        <div className="mb-4">
          <label htmlFor="file" className="block mb-2 text-sm font-medium">
            Choose File
          </label>
          <input
            type="file"
            id="file"
            onChange={changeHandler}
            className="w-full text-sm bg-gray-800 text-white border border-gray-700 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
        </div>
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          onClick={handleSubmission}
        >
          Submit
        </button>
      </div>

      {/* Uploaded Hash */}
      {ipfsHash && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-md max-w-md w-full break-words">
          <h3 className="text-lg font-semibold mb-2">IPFS Hash:</h3>
          <p className="text-sm text-gray-300">{ipfsHash}</p>
        </div>
      )}

      {/* Retrieve Button */}
      <div className="max-w-md w-full">
        <button
          onClick={retrieveHashFromBlockchain}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Retrieve Stored Hash
        </button>
      </div>

      {/* Retrieved Hash */}
      {storedHash && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-md max-w-md w-full break-words">
          <h3 className="text-lg font-semibold mb-2">Retrieved Hash:</h3>
          <p className="text-sm text-gray-300">{storedHash}</p>
        </div>
      )}
    </div>
  );
}
