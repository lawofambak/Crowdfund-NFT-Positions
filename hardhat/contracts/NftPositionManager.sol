//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./CrowdfundPlatform.sol";

contract NftPositionManager is ERC721URIStorage {
    // Token IDs
    uint256 public _tokenId;
    // Admin address
    address public admin;
    // CrowdfundPlatform contract
    CrowdfundPlatform public _crowdfundContract;

    constructor() ERC721("Crowdfund Position", "FUND") {
        admin = msg.sender;
    }

    // Details about crowdfund position
    struct Position {
        // Crowdfund campaign ID
        uint256 campaignId;
        // Amount of tokens contributed
        uint256 tokenAmount;
    }

    // Mapping of token ID to position data
    mapping(uint256 => Position) private _positions;

    // Set CrowdfundPlatform contract address
    function setCrowdfundAddress(address crowdfundAddress) external {
        require(msg.sender == admin, "Not admin");
        _crowdfundContract = CrowdfundPlatform(crowdfundAddress);
    }

    // Returns position data associated with given token ID
    function positions(uint256 tokenId)
        external
        view
        returns (uint256 campaignId, uint256 tokenAmount)
    {
        Position memory position = _positions[tokenId];
        return (position.campaignId, position.tokenAmount);
    }

    // Creates a new position
    function mint(
        address recipient,
        uint256 campaignId,
        uint256 tokenAmount
    ) external {
        _crowdfundContract.pledgeToCampaign(recipient, campaignId, tokenAmount);

        _tokenId++;

        _positions[_tokenId] = Position({
            campaignId: campaignId,
            tokenAmount: tokenAmount
        });

        _mint(recipient, _tokenId);
    }

    // Unpledge (burn) position
    function burn(uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), "Not owner");

        _crowdfundContract.unpledgeFromCampaign(
            msg.sender,
            _positions[tokenId].campaignId,
            _positions[tokenId].tokenAmount
        );

        delete _positions[tokenId];

        _burn(tokenId);
    }

    // Get refund (burn) position
    function burn2(uint256 tokenId) external {
        require(msg.sender == ownerOf(tokenId), "Not owner");

        _crowdfundContract.refundFromCampaign(
            msg.sender,
            _positions[tokenId].campaignId,
            _positions[tokenId].tokenAmount
        );

        delete _positions[tokenId];

        _burn(tokenId);
    }
}
