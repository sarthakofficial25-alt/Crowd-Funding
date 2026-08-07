#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Map};

// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Campaigns,
    Funds,
}

#[contract]
pub struct CrowdFunding;

#[contractimpl]
impl CrowdFunding {

    // Create a new campaign
    pub fn create_campaign(env: Env, creator: Address, goal: i128) {
        creator.require_auth();

        let mut campaigns: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Campaigns).unwrap_or(Map::new(&env));

        campaigns.set(creator.clone(), goal);
        env.storage().instance().set(&DataKey::Campaigns, &campaigns);

        let mut funds: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Funds).unwrap_or(Map::new(&env));

        funds.set(creator, 0);
        env.storage().instance().set(&DataKey::Funds, &funds);
    }

    // Contribute to a campaign
    pub fn contribute(env: Env, from: Address, creator: Address, amount: i128) {
        from.require_auth();

        let mut funds: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Funds).unwrap_or(Map::new(&env));

        let current = funds.get(creator.clone()).unwrap_or(0);
        funds.set(creator, current + amount);

        env.storage().instance().set(&DataKey::Funds, &funds);
    }

    // Get total funds
    pub fn get_funds(env: Env, creator: Address) -> i128 {
        let funds: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Funds).unwrap_or(Map::new(&env));

        funds.get(creator).unwrap_or(0)
    }

    // Get goal
    pub fn get_goal(env: Env, creator: Address) -> i128 {
        let campaigns: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Campaigns).unwrap_or(Map::new(&env));

        campaigns.get(creator).unwrap_or(0)
    }
}