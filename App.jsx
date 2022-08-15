import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNft.json';

// Constants
const CONTRACT_ADDRESS = '0xF8CB6bcf778DcF3C699aB662Dd917eFa64daAf7B';
const TWITTER_HANDLE = '_OkoliEvans';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = `https://testnets.opensea.io/collection/squarenft-udha8p1j0b`;
const TOTAL_MINT_COUNT = 50;

const App = () => {
  // declare a var to store user's public address
  const [currentAccount, setCurrentAccount] = useState('');

  //check if wallet is installed
  const checkIfWalletIsConnected = async () => {
    // first make sure you have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Install Metamask');
      return;
    } else {
      console.log('Wallet detected: ', ethereum);
    }

    //  confirm that user is connected on the correct chain
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('connected to chain' + chainId);

    //string, hex code of the rinkeby test network
    const rinkebyChainId = '0x4';
    if (chainId !== rinkebyChainId) {
      alert('You are not connected to the Rinkeby test network');
    }


    //check if we are authorized to access user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // user can have multiple accounts, we grag the first one
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Authorized account: ', account);
      setCurrentAccount(account);
      //set up event listener
      setupEventListener();
    } else {
      console.log('No authorized account found.');
    }
  }

  // connect wallet method...
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Install Metamask');
        return;
      }

      // method to request access to account
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      // print the address once we connect Metamask
      console.log('Connected:', accounts[0]);
      setCurrentAccount(accounts[0]);
      //set up event listener
      setupEventListener();

    } catch (error) {
      console.log(error);
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Event listener fired!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  //Mint method here...
  const askContractToMintNFT = async () => {

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // going to pop out wallet now to pay gas
        let nftTxn = await connectedContract.makeAnEpicNft();

        console.log('Mining... please wait.');
        await nftTxn.wait();

        console.log(`Mined! See txn: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log('Ethereum object not found.');
      }
    } catch (error) {
      console.log(error);
    }
  }

  // this runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUi = () => (
    <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
      Mint NFT
            </button>
  );

  //create a conditional render to hide 'connect wallet' button after login

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>

          {currentAccount === '' ? renderNotConnectedContainer() : renderMintUi()};

        </div>

        <div>
          <a
            className="viewNfts"
            href={OPENSEA_LINK}
            target='_blank'
            rel='noreferrer'>
            View NFTs on OpenSea.
            </a>
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
