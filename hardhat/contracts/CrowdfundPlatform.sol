//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrowdfundPlatform {
    // ERC20 token interface
    IERC20 public _token;
    // Admin address
    address public _admin;
    // NftPositionManager contract address
    address public _nftAddress;

    // Details about campaign
    struct Campaign {
        // Creator of campaign
        address creator;
        // Amount of tokens to raise
        uint256 goal;
        // Amount of tokens pledged
        uint256 pledged;
        // Start of campaign
        uint256 startAt;
        // End of campaign
        uint256 endAt;
        // Goal reached and creator claimed tokens?
        bool claimed;
    }

    // Campaign IDs and total campaigns
    uint256 public _campaignCount;
    // Mapping of campaign ID to campaign data
    mapping(uint256 => Campaign) public _campaigns;

    constructor(address tokenAddress_, address nftAddress_) {
        _admin = msg.sender;
        _token = IERC20(tokenAddress_);
        _nftAddress = nftAddress_;
    }

    modifier onlyManager() {
        require(msg.sender == _nftAddress, "Not manager");
        _;
    }

    // Create campaign
    function createCampaign(
        uint256 goal_,
        uint256 startAt_,
        uint256 endAt_
    ) external {
        require(goal_ > 0, "Goal <= 0");
        require(startAt_ >= block.timestamp, "Start time < present");
        require(endAt_ >= startAt_, "End time < Start time");
        require(
            (endAt_ - startAt_) <= 60 days,
            "Max crowdfund duration is 60 days"
        );

        _campaignCount++;

        _campaigns[_campaignCount] = Campaign({
            creator: msg.sender,
            goal: goal_,
            pledged: 0,
            startAt: startAt_,
            endAt: endAt_,
            claimed: false
        });
    }

    // Cancel campaign
    function cancelCampaign(uint256 campaignId_) external {
        Campaign memory campaign = _campaigns[campaignId_];

        require(campaign.creator == msg.sender, "Not creator");
        require(campaign.startAt > block.timestamp, "Campaign already started");

        delete _campaigns[campaignId_];
    }

    // Pledge to campaign
    function pledgeToCampaign(
        address pledger_,
        uint256 campaignId_,
        uint256 amount_
    ) external onlyManager {
        require(pledger_ != address(0), "Invalid address");
        require(campaignId_ > 0, "Invalid Campaign ID");
        require(amount_ > 0, "Invalid amount");

        Campaign storage campaign = _campaigns[campaignId_];

        require(campaign.startAt <= block.timestamp, "Campaign not started");
        require(campaign.endAt >= block.timestamp, "Campaign ended");

        campaign.pledged += amount_;
        _token.transferFrom(pledger_, address(this), amount_);
    }

    // Unpledge from campaign
    function unpledgeFromCampaign(
        address pledger_,
        uint256 campaignId_,
        uint256 amount_
    ) external onlyManager {
        require(pledger_ != address(0), "Invalid address");
        require(campaignId_ > 0, "Invalid Campaign ID");
        require(amount_ > 0, "Invalid amount");

        Campaign storage campaign = _campaigns[campaignId_];

        require(campaign.endAt >= block.timestamp, "Campaign ended");

        campaign.pledged -= amount_;
        _token.transfer(pledger_, amount_);
    }

    // Get refund from campaign
    function refundFromCampaign(
        address pledger_,
        uint256 campaignId_,
        uint256 amount_
    ) external onlyManager {
        require(pledger_ != address(0), "Invalid address");
        require(campaignId_ > 0, "Invalid Campaign ID");
        require(amount_ > 0, "Invalid amount");

        Campaign memory campaign = _campaigns[campaignId_];

        require(campaign.endAt < block.timestamp, "Campaign not ended");
        require(campaign.goal > campaign.pledged, "Goal met");

        _token.transfer(pledger_, amount_);
    }

    // Claim from campaign
    function claimFromCampaign(uint256 campaignId_) external {
        Campaign storage campaign = _campaigns[campaignId_];

        require(campaign.creator == msg.sender, "Not creator");
        require(campaign.endAt < block.timestamp, "Campaign not ended");
        require(campaign.pledged >= campaign.goal, "Goal not met");
        require(!campaign.claimed, "Already claimed");

        campaign.claimed = true;
        _token.transfer(campaign.creator, campaign.pledged);
    }
}
