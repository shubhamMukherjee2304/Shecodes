import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

export const TransactionsProvider = ({ children }) => {
  const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData(prevState => ({ ...prevState, [name]: e.target.value }));
  };

  const createEthereumContract = async () => {
    if (!window.ethereum) {
      console.error("MetaMask or another Ethereum wallet not detected.");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log(provider, signer, transactionsContract);
    return transactionsContract;
  };

  const getAllTransactions = async () => {
    try {
      const transactionsContract = await createEthereumContract();
      if (!transactionsContract) return;

      const availableTransactions = await transactionsContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(transaction => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }));

      console.log(structuredTransactions);
      setTransactions(structuredTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask or another Ethereum wallet not detected.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionsContract = await createEthereumContract();
      if (!transactionsContract) return;

      const currentTransactionCount = await transactionsContract.getTransactionCount();
      localStorage.setItem("transactionCount", currentTransactionCount);
      setTransactionCount(currentTransactionCount.toNumber());
    } catch (error) {
      console.error("Error checking transactions:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask or another Ethereum wallet not detected.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const sendTransaction = async () => {
    try {
      const { addressTo, amount, keyword, message } = formData;
      const transactionsContract = await createEthereumContract();
      if (!transactionsContract) return;

      const parsedAmount = ethers.utils.parseEther(amount);

      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208",
          value: parsedAmount.toHexString(),
        }],
      });

      const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - ${transactionHash.hash}`);
      setIsLoading(false);

      const transactionsCount = await transactionsContract.getTransactionCount();
      setTransactionCount(transactionsCount.toNumber());
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
