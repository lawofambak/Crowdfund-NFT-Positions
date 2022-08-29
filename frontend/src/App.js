import './App.css';
import { React, useState } from "react";
import { ethers } from "ethers";
import crowdfundAbi from "./abi/CrowdfundPlatform.json";
import nftAbi from "./abi/NftPositionManager.json";
import tokenAbi from "./abi/Token.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // State variables
  const [account, setAccount] = useState([]);

  // Contract addresses
  const tokenAddress = "0x5FADa42917a63bA7861c9F0d8bDC7FA58c6e9204";
  const nftAddress = "0xC0979412F23FB909d19B716Abcf4df45aF7123De";
  const crowdfundAddress = "0x6ab08F7E9f96c4E64d2b631DF6692DDBb443d5FD";

  const eighteenZeros = ethers.BigNumber.from(10).pow(18);

  // Connect MetaMask account
  const connectAccount = async () => {
    try {
      if (window.ethereum) {
        const user = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(user);
      } else {
        window.alert("Need MetaMask Installed.")
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Create campaign
  const create = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let goal = data.get("goal");
    let startat = data.get("startat");
    let endat = data.get("endat");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      if (networkName === "goerli") {
        const signer = provider.getSigner();

        goal = parseInt(goal);
        startat = parseInt(startat);
        endat = parseInt(endat);

        const crowdfundContract = new ethers.Contract(
          crowdfundAddress,
          crowdfundAbi.abi,
          signer
        );

        // Create campaign
        const tx1 = await crowdfundContract.createCampaign(goal, startat, endat);
        const id1 = toast.loading("Creating campaign...", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "ToastMessage"
        });
        await tx1.wait();
        toast.update(id1, { render: "Campaign created", type: "success", isLoading: false, className: "ToastMessage" });
      } else {
        window.alert("Need to be on Goerli");
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Cancel campaign
  const cancel = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let cancelid = data.get("cancelid");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      if (networkName === "goerli") {
        const signer = provider.getSigner();

        cancelid = parseInt(cancelid);

        const crowdfundContract = new ethers.Contract(
          crowdfundAddress,
          crowdfundAbi.abi,
          signer
        );

        // Cancel campaign
        const tx1 = await crowdfundContract.cancelCampaign(cancelid);
        const id1 = toast.loading("Cancelling campaign...", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "ToastMessage"
        });
        await tx1.wait();
        toast.update(id1, { render: "Campaign cancelled", type: "success", isLoading: false, className: "ToastMessage" });
      } else {
        window.alert("Need to be on Goerli");
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Lets user pledge
  const pledge = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let recipient = data.get("recipient");
    let campaignid = data.get("campaignid");
    let amount = data.get("amount");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      if (networkName === "goerli") {
        try {
          const signer = provider.getSigner();

          recipient = ethers.utils.getAddress(recipient);
          campaignid = parseInt(campaignid);
          amount = ethers.BigNumber.from(parseFloat(amount)).mul(eighteenZeros);

          const tokenContract = new ethers.Contract(
            tokenAddress,
            tokenAbi.abi,
            signer
          );

          const nftContract = new ethers.Contract(
            nftAddress,
            nftAbi.abi,
            signer
          );

          // Approve send of token
          const tx1 = await tokenContract.approve(crowdfundAddress, amount);
          const id1 = toast.loading("Appoving token...", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "ToastMessage"
          });
          await tx1.wait();
          toast.update(id1, { render: "Token approved", type: "success", isLoading: false, className: "ToastMessage" });

          // Pledge to campaign
          const tx2 = await nftContract.mint(recipient, campaignid, amount);
          const id2 = toast.loading("Pledging to campaign...", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "ToastMessage"
          });
          await tx2.wait();
          toast.update(id2, { render: "Pledged to campaign", type: "success", isLoading: false, className: "ToastMessage" });
        } catch (error) {
          window.alert(error.message);
        }
      } else {
        window.alert("Need to be on Goerli");
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Lets user unpledge
  const unpledge = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let unpledgeid = data.get("unpledgeid");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      if (networkName === "goerli") {
        const signer = provider.getSigner();

        unpledgeid = parseInt(unpledgeid);

        const nftContract = new ethers.Contract(
          nftAddress,
          nftAbi.abi,
          signer
        );

        // Pledge to campaign
        const tx1 = await nftContract.burn(unpledgeid);
        const id1 = toast.loading("Unpledging from campaign...", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "ToastMessage"
        });
        await tx1.wait();
        toast.update(id1, { render: "Unpledged from campaign", type: "success", isLoading: false, className: "ToastMessage" });
      } else {
        window.alert("Need to be on Goerli");
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Lets user get a refund
  const refund = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let refundid = data.get("refundid");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      if (networkName === "goerli") {
        const signer = provider.getSigner();

        refundid = parseInt(refundid);

        const nftContract = new ethers.Contract(
          nftAddress,
          nftAbi.abi,
          signer
        );

        // Get refund from campaign
        const tx1 = await nftContract.burn2(refundid);
        const id1 = toast.loading("Refunding from campaign...", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "ToastMessage"
        });
        await tx1.wait();
        toast.update(id1, { render: "Refunded from campaign", type: "success", isLoading: false, className: "ToastMessage" });
      } else {
        window.alert("Need to be on Goerli");
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Claim from campaign
  const claim = async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    let claimid = data.get("claimid");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      if (networkName === "goerli") {
        const signer = provider.getSigner();

        claimid = parseInt(claimid);

        const crowdfundContract = new ethers.Contract(
          crowdfundAddress,
          crowdfundAbi.abi,
          signer
        );

        // Claim from campaign
        const tx1 = await crowdfundContract.claimFromCampaign(claimid);
        const id1 = toast.loading("Claiming from campaign...", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "ToastMessage"
        });
        await tx1.wait();
        toast.update(id1, { render: "Claimed from campaign", type: "success", isLoading: false, className: "ToastMessage" });
      } else {
        window.alert("Need to be on Goerli");
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="App">
      {account.length ?
        (
          <div className="App">
            <h1 className="Header">Crowdfund Platform</h1>
            <h3>Connected Account : {account[0]}</h3>
            <div>
              <div className="InputApp">
                <form className="InputForm" onSubmit={create}>
                  <h2>Create</h2>
                  <div className="InputLine">
                    <label>Goal : </label>
                    <input name="goal" type="text" />
                  </div>
                  <div className="InputLine">
                    <label>Start At : </label>
                    <input name="startat" type="text" />
                  </div>
                  <div className="InputLine">
                    <label>End At : </label>
                    <input name="endat" type="text" />
                  </div>
                  <button type="submit" className="Button">Create</button>
                </form>
              </div>
              <div className="InputApp">
                <form className="InputForm" onSubmit={cancel}>
                  <h2>Cancel</h2>
                  <div className="InputLine">
                    <label>Campaign ID : </label>
                    <input name="cancelid" type="text" />
                  </div>
                  <button type="submit" className="Button">Cancel</button>
                </form>
              </div>
              <div className="InputApp">
                <form className="InputForm" onSubmit={claim}>
                  <h2>Claim</h2>
                  <div className="InputLine">
                    <label>Campaign ID : </label>
                    <input name="claimid" type="text" />
                  </div>
                  <button type="submit" className="Button">Claim</button>
                </form>
              </div>
            </div>
            <div>
              <div className="InputApp">
                <form className="InputForm" onSubmit={pledge}>
                  <h2>Pledge</h2>
                  <div className="InputLine">
                    <label>Recipient : </label>
                    <input name="recipient" type="text" />
                  </div>
                  <div className="InputLine">
                    <label>Campaign ID : </label>
                    <input name="campaignid" type="text" />
                  </div>
                  <div className="InputLine">
                    <label>Amount : </label>
                    <input name="amount" type="text" />
                  </div>
                  <button type="submit" className="Button">Pledge</button>
                </form>
              </div>
              <div className="InputApp">
                <form className="InputForm" onSubmit={unpledge}>
                  <h2>Unpledge</h2>
                  <div className="InputLine">
                    <label>Campaign ID : </label>
                    <input name="unpledgeid" type="text" />
                  </div>
                  <button type="submit" className="Button">Unpledge</button>
                </form>
              </div>
              <div className="InputApp">
                <form className="InputForm" onSubmit={refund}>
                  <h2>Refund</h2>
                  <div className="InputLine">
                    <label>Campaign ID : </label>
                    <input name="refundid" type="text" />
                  </div>
                  <button type="submit" className="Button">Refund</button>
                </form>
              </div>
            </div>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        ) : (
          <div className="Frontpage">
            <button className="ConnectWallet" onClick={connectAccount}>Connect Wallet To Enter</button>
          </div>
        )
      }
    </div >
  );
}

export default App;
