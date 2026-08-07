#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize_and_mint() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RewardToken, ());
    let client = RewardTokenClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(
        &admin,
        &String::from_str(&env, "CrowdReward"),
        &String::from_str(&env, "CRWD"),
        &7_u32,
    );

    assert_eq!(client.name(), String::from_str(&env, "CrowdReward"));
    assert_eq!(client.symbol(), String::from_str(&env, "CRWD"));
    assert_eq!(client.decimals(), 7);

    client.mint(&admin, &user, &100_i128);
    assert_eq!(client.balance(&user), 100);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RewardToken, ());
    let client = RewardTokenClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    client.initialize(
        &admin,
        &String::from_str(&env, "CrowdReward"),
        &String::from_str(&env, "CRWD"),
        &7_u32,
    );

    client.initialize(
        &admin,
        &String::from_str(&env, "CrowdReward"),
        &String::from_str(&env, "CRWD"),
        &7_u32,
    );
}
