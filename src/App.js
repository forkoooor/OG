import React, { Component, useState } from 'react'
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import './App.css'
import OG from './abis/OG.json'
import { Footer, Balance, Header, Rules } from './containers';
import {  Navbar } from './components';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      network: { name: 'rinkeby', id: 4 },
      //network: { name: 'mainnet', id: 1 },
      mintFunction: null,
      connectFunction: null,
      remainingMintsForWallet: 0,
      connected: false,
      soldOut: false,
      signerAddress: '',
      contract: null,
      balance: 0,
      totalSupply: 0,
      maxPerWallet: 10,
      walletLoaded: false,
      featuredOg: { },
      featuredOgExists: false,
      ogTwitterUrl: 'https://twitter.com/og_nft_official',
      discordUrl: 'https://discord.com/invite/kTvaHARW',
      tankTwitterUrl: 'https://twitter.com/nfttank',
      contractUrl: '',
      storeUrl: '',
      ownedOgs: [],
    }
  }

  async componentWillMount() {

    const networkId = this.state.network.id
    const networkName = this.state.network.name
    const networkAddress = OG.networks[networkId].address

    this.setState({ mintFunction: () => this.mintRandom(this) })
    this.setState({ connectFunction: () => this.connect(this.state.network) })

    if (networkId === 1) {
      this.setState({ contractUrl: "https://etherscan.io/address/" + networkAddress })
      this.setState({ storeUrl: "https://opensea.io/assets/" + networkAddress })
    }
    else {
      this.setState({ contractUrl: "https://" + networkName + ".etherscan.io/address/" + networkAddress })
      this.setState({ storeUrl: "https://testnets.opensea.io/assets/" + networkAddress })
    }
  }

  async connect(network) {

    const providerOptions = {
      /* See Provider Options Section */
    };
    
    const web3Modal = new Web3Modal({
      network: this.state.network.name,
      cacheProvider: true,
      providerOptions
    });

    const instance = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    
    // The Contract object
    const contract = new ethers.Contract(OG.networks[this.state.network.id].address, OG.abi, provider);

    this.setState({ provider: provider })
    this.setState({ signer: signer })
    this.setState({ signerAddress: await this.state.signer.getAddress()})
    this.setState({ connected: this.state.signerAddress !== ''})
    this.setState({ contract: contract })

    const remainingMints = await this.getRemainingMintsForWallet()
    this.setState({ remainingMintsForWallet: remainingMints })

    await this.loadTokens()
  }

  async loadTokens() {

    const balance = await this.state.contract.balanceOf(this.state.signerAddress)
    this.setState({ balance: balance})

    const totalSupply = await this.state.contract.totalSupply()
    this.setState({ totalSupply: totalSupply })
    this.setState({ soldOut: totalSupply >= 10000})

    this.setState({ walletLoaded: true })
    
    const randomId = Math.floor(Math.random() * 10000)
    const featuredSvg = await this.state.contract.renderSvg(randomId)
    this.setState({ featuredOg: { id: randomId, svg: featuredSvg }})
    
    // ownerOf might crash and abort the methods execution
    try {
      const owner = await this.state.contract.ownerOf(randomId)
      this.setState({ featuredOgExists: owner !== '' })
    } catch {}

    this.setState({ ownedOgs: []})

    for (var i = 0; i < balance; i++) {
      const ogId = await this.state.contract.tokenOfOwnerByIndex(this.state.signerAddress, i)
      const ogSvg = await this.state.contract.renderSvg(ogId)

      this.setState({ ownedOgs: this.state.ownedOgs.concat({id: ogId, svg: ogSvg})})
    }
  }

  getRemainingMintsForWallet = async() => {
    
    const balance = await this.state.contract.balanceOf(this.state.signerAddress)
    
    let count = this.state.maxPerWallet - balance;

    if (count < 0) {
      return 0
    } else if (count > 5) {
      return 5
    }

    const totalSupply = await this.state.contract.totalSupply()
    const available = 10000 - totalSupply
    if (count > available)
      return available

    return count
  }

  mintRandom = async(app) => {


    if (app.state.contract == null)
      await app.connect(app.state.network);

    if (app.state.contract == null)
      return;

    const count = await app.getRemainingMintsForWallet()

    const canMint = count > 0 && !app.state.soldOut

    if (canMint) {
      const seed = new Date().getMilliseconds()
      const suggested = await app.state.contract.suggestFreeIds(count, seed)
      //await app.state.contract.methods.mint(suggested).send({ from: app.state.signerAddress })

      //await app.loadTokens()
    }
  }

  render() {
    return (
        <div className="App">
          <div className="gradient__bg">
            <Navbar data={this.state} />
            <Header data={this.state} />
          </div>
          <Rules />
          {   this.state.connected &&
                <Balance data={this.state} />
          }
          <Footer data={this.state} />
        </div>
    );
  }
}

export default App;