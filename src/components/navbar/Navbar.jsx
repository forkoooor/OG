import React from 'react';
import logo from '../../assets/OG.svg';
import './navbar.css';

const Navbar = (props) => {

  return (
    <div className="gpt3__navbar">
      <div className="gpt3__navbar-links">
        <div className="gpt3__navbar-links_logo">
      <h1 className="gradient__text">&#35;iamanumber</h1>
        </div>
      </div>
      <div className="gpt3__navbar-sign">
        {   props.data.account === '' &&
                <button>Connect</button>
        }
        {   props.data.account !== '' &&
                <button>{props.data.account}</button>
        }
        <a href={props.data.storeUrl} target="_blank" rel="noopener noreferrer">OpenSea</a>
        <a href={props.data.ogTwitterUrl} target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href={props.data.storeUrl} target="_blank" rel="noopener noreferrer">Discord</a>
        <a href={props.data.contractUrl} target="_blank" rel="noopener noreferrer">Contract</a>
      </div>
    </div>
  );
};

export default Navbar;
