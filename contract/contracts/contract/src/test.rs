#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

/// Helper: create a default env + register the contract
fn setup() -> (Env, Address, CrowdFundingClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, CrowdFunding);
    let client = CrowdFundingClient::new(&env, &contract_id);
    (env, contract_id, client)
}

#[test]
fn test_create_campaign() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);

    // Create a campaign
    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Test Campaign"),
        &1000_i128,
        &9999999999_u64,
    );

    assert_eq!(campaign_id, 0);

    // Verify campaign data
    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.goal, 1000);
    assert_eq!(campaign.raised, 0);
    assert_eq!(campaign.status, CampaignStatus::Active);
    assert_eq!(campaign.contributor_count, 0);
}

#[test]
fn test_create_multiple_campaigns() {
    let (env, _contract_id, client) = setup();
    let creator1 = Address::generate(&env);
    let creator2 = Address::generate(&env);

    let id1 = client.create_campaign(
        &creator1,
        &String::from_str(&env, "Campaign 1"),
        &500_i128,
        &9999999999_u64,
    );
    let id2 = client.create_campaign(
        &creator2,
        &String::from_str(&env, "Campaign 2"),
        &2000_i128,
        &9999999999_u64,
    );

    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(client.get_campaign_count(), 2);
}

#[test]
fn test_contribute_to_campaign() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);
    let contributor = Address::generate(&env);

    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Test Campaign"),
        &1000_i128,
        &9999999999_u64,
    );

    // Contribute
    client.contribute(&contributor, &campaign_id, &250_i128);

    // Verify funds
    assert_eq!(client.get_funds(&campaign_id), 250);
    assert_eq!(client.get_contribution(&campaign_id, &contributor), 250);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.contributor_count, 1);
    assert_eq!(campaign.status, CampaignStatus::Active);
}

#[test]
fn test_contribute_multiple_contributors() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);
    let contrib1 = Address::generate(&env);
    let contrib2 = Address::generate(&env);

    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Multi-Contrib Campaign"),
        &1000_i128,
        &9999999999_u64,
    );

    client.contribute(&contrib1, &campaign_id, &300_i128);
    client.contribute(&contrib2, &campaign_id, &200_i128);
    client.contribute(&contrib1, &campaign_id, &100_i128); // same contributor again

    assert_eq!(client.get_funds(&campaign_id), 600);
    assert_eq!(client.get_contribution(&campaign_id, &contrib1), 400);
    assert_eq!(client.get_contribution(&campaign_id, &contrib2), 200);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.contributor_count, 2); // only 2 unique
}

#[test]
fn test_campaign_funded_on_goal_reached() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);
    let contributor = Address::generate(&env);

    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Goal Test"),
        &500_i128,
        &9999999999_u64,
    );

    client.contribute(&contributor, &campaign_id, &500_i128);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.status, CampaignStatus::Funded);
    assert_eq!(campaign.raised, 500);
}

#[test]
fn test_withdraw_after_funded() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);
    let contributor = Address::generate(&env);

    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Withdraw Test"),
        &100_i128,
        &9999999999_u64,
    );

    // Fund the campaign
    client.contribute(&contributor, &campaign_id, &100_i128);

    // Withdraw
    client.withdraw(&creator, &campaign_id);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.status, CampaignStatus::Withdrawn);
}

#[test]
fn test_cancel_campaign() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);

    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Cancel Test"),
        &1000_i128,
        &9999999999_u64,
    );

    client.cancel_campaign(&creator, &campaign_id);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.status, CampaignStatus::Cancelled);
}

#[test]
#[should_panic(expected = "Campaign not found")]
fn test_get_nonexistent_campaign() {
    let (_env, _contract_id, client) = setup();
    client.get_campaign(&999);
}

#[test]
fn test_get_goal_and_funds() {
    let (env, _contract_id, client) = setup();
    let creator = Address::generate(&env);

    let campaign_id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Read Test"),
        &750_i128,
        &9999999999_u64,
    );

    assert_eq!(client.get_goal(&campaign_id), 750);
    assert_eq!(client.get_funds(&campaign_id), 0);
}
