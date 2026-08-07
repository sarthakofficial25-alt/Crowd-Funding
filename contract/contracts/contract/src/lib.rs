#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short, token, Address, BytesN, Env,
    Map, String, Symbol, Vec,
};

// ============================================================
// Error Codes
// ============================================================

#[contracterror]
#[derive(Clone, Debug, PartialEq)]
#[repr(u32)]
pub enum CrowdFundError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    CampaignNotFound = 3,
    CampaignAlreadyExists = 4,
    InvalidGoal = 5,
    InvalidAmount = 6,
    CampaignNotActive = 7,
    NotCampaignCreator = 8,
    GoalNotReached = 9,
    AlreadyWithdrawn = 10,
    DeadlinePassed = 11,
    DeadlineNotPassed = 12,
}

// ============================================================
// Data Types
// ============================================================

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum CampaignStatus {
    Active,
    Funded,
    Withdrawn,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Campaign {
    pub creator: Address,
    pub title: String,
    pub goal: i128,
    pub raised: i128,
    pub deadline: u64,
    pub status: CampaignStatus,
    pub contributor_count: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Campaigns,
    CampaignData(u32),
    Contributions(u32),
    CampaignCount,
    RewardToken,
}

// ============================================================
// Contract
// ============================================================

#[contract]
pub struct CrowdFunding;

#[contractimpl]
impl CrowdFunding {
    /// Initialize the contract with an admin and optional reward token address
    pub fn initialize(env: Env, admin: Address, reward_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::RewardToken, &reward_token);
        env.storage().instance().set(&DataKey::CampaignCount, &0u32);
    }

    /// Create a new crowdfunding campaign
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        goal: i128,
        deadline: u64,
    ) -> u32 {
        creator.require_auth();

        if goal <= 0 {
            panic!("Goal must be positive");
        }

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);
        let campaign_id = count;

        let campaign = Campaign {
            creator: creator.clone(),
            title: title.clone(),
            goal,
            raised: 0,
            deadline,
            status: CampaignStatus::Active,
            contributor_count: 0,
        };

        env.storage()
            .instance()
            .set(&DataKey::CampaignData(campaign_id), &campaign);

        // Initialize empty contributions map for this campaign
        let contributions: Map<Address, i128> = Map::new(&env);
        env.storage()
            .instance()
            .set(&DataKey::Contributions(campaign_id), &contributions);

        env.storage()
            .instance()
            .set(&DataKey::CampaignCount, &(count + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("campaign"), symbol_short!("created")),
            (campaign_id, creator, goal),
        );

        campaign_id
    }

    /// Contribute to a campaign
    pub fn contribute(env: Env, from: Address, campaign_id: u32, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::CampaignData(campaign_id))
            .expect("Campaign not found");

        // Verify campaign is active
        if campaign.status != CampaignStatus::Active {
            panic!("Campaign is not active");
        }

        // Update contributions
        let mut contributions: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&DataKey::Contributions(campaign_id))
            .unwrap_or(Map::new(&env));

        let current = contributions.get(from.clone()).unwrap_or(0);
        contributions.set(from.clone(), current + amount);

        env.storage()
            .instance()
            .set(&DataKey::Contributions(campaign_id), &contributions);

        // Update campaign
        if current == 0 {
            campaign.contributor_count += 1;
        }
        campaign.raised += amount;

        // Check if goal reached
        if campaign.raised >= campaign.goal {
            campaign.status = CampaignStatus::Funded;

            env.events().publish(
                (symbol_short!("campaign"), symbol_short!("funded")),
                (campaign_id, campaign.raised),
            );
        }

        env.storage()
            .instance()
            .set(&DataKey::CampaignData(campaign_id), &campaign);

        // Emit contribution event
        env.events().publish(
            (symbol_short!("contrib"), symbol_short!("made")),
            (campaign_id, from.clone(), amount),
        );

        // Inter-contract call: mint reward tokens to contributor
        // Reward = 10% of contribution amount as reward tokens
        if env.storage().instance().has(&DataKey::RewardToken) {
            let reward_token: Address = env
                .storage()
                .instance()
                .get(&DataKey::RewardToken)
                .unwrap();
            let reward_amount = amount / 10; // 10% reward
            if reward_amount > 0 {
                let admin: Address =
                    env.storage().instance().get(&DataKey::Admin).unwrap();
                // Call the reward token contract to mint tokens
                // This demonstrates inter-contract communication
                env.invoke_contract::<()>(
                    &reward_token,
                    &Symbol::new(&env, "mint"),
                    (admin.clone(), from.clone(), reward_amount).into_val(&env),
                );

                env.events().publish(
                    (symbol_short!("reward"), symbol_short!("minted")),
                    (from, reward_amount),
                );
            }
        }
    }

    /// Withdraw funds (only campaign creator, only when goal is reached)
    pub fn withdraw(env: Env, creator: Address, campaign_id: u32) {
        creator.require_auth();

        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::CampaignData(campaign_id))
            .expect("Campaign not found");

        if campaign.creator != creator {
            panic!("Not campaign creator");
        }

        if campaign.status != CampaignStatus::Funded {
            panic!("Goal not reached or already withdrawn");
        }

        campaign.status = CampaignStatus::Withdrawn;
        env.storage()
            .instance()
            .set(&DataKey::CampaignData(campaign_id), &campaign);

        // Emit event
        env.events().publish(
            (symbol_short!("campaign"), symbol_short!("withdraw")),
            (campaign_id, campaign.raised),
        );
    }

    /// Cancel a campaign (only creator, only if active)
    pub fn cancel_campaign(env: Env, creator: Address, campaign_id: u32) {
        creator.require_auth();

        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::CampaignData(campaign_id))
            .expect("Campaign not found");

        if campaign.creator != creator {
            panic!("Not campaign creator");
        }

        if campaign.status != CampaignStatus::Active {
            panic!("Campaign not active");
        }

        campaign.status = CampaignStatus::Cancelled;
        env.storage()
            .instance()
            .set(&DataKey::CampaignData(campaign_id), &campaign);

        env.events().publish(
            (symbol_short!("campaign"), symbol_short!("cancel")),
            (campaign_id,),
        );
    }

    // ── Read Methods ────────────────────────────────────────────

    /// Get campaign details by ID
    pub fn get_campaign(env: Env, campaign_id: u32) -> Campaign {
        env.storage()
            .instance()
            .get(&DataKey::CampaignData(campaign_id))
            .expect("Campaign not found")
    }

    /// Get total funds raised for a campaign
    pub fn get_funds(env: Env, campaign_id: u32) -> i128 {
        let campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::CampaignData(campaign_id))
            .unwrap_or(Campaign {
                creator: env.current_contract_address(),
                title: String::from_str(&env, ""),
                goal: 0,
                raised: 0,
                deadline: 0,
                status: CampaignStatus::Active,
                contributor_count: 0,
            });
        campaign.raised
    }

    /// Get goal for a campaign
    pub fn get_goal(env: Env, campaign_id: u32) -> i128 {
        let campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::CampaignData(campaign_id))
            .unwrap_or(Campaign {
                creator: env.current_contract_address(),
                title: String::from_str(&env, ""),
                goal: 0,
                raised: 0,
                deadline: 0,
                status: CampaignStatus::Active,
                contributor_count: 0,
            });
        campaign.goal
    }

    /// Get total number of campaigns
    pub fn get_campaign_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }

    /// Get contribution amount for a specific contributor in a campaign
    pub fn get_contribution(env: Env, campaign_id: u32, contributor: Address) -> i128 {
        let contributions: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&DataKey::Contributions(campaign_id))
            .unwrap_or(Map::new(&env));
        contributions.get(contributor).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;