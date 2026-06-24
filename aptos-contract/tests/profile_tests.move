/// Comprehensive test suite for ChainProfile::profile module
/// Run with: aptos move test
#[test_only]
module ChainProfile::profile_tests {
    use std::string::utf8;
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use ChainProfile::profile;

    // ── Helpers ──────────────────────────────────────────────────────────────────
    fun setup(s: &signer) {
        account::create_account_for_test(signer::address_of(s));
        timestamp::set_time_has_started_for_testing(s);
    }

    fun default_profile(s: &signer) {
        let skills = vector[utf8(b"Move"), utf8(b"Rust"), utf8(b"TypeScript")];
        profile::create_profile(s, utf8(b"Alice"), utf8(b"Aptos developer"), skills, utf8(b"QmHash123"));
    }

    // ── Test 1: Create profile successfully ───────────────────────────────────
    #[test(user = @0xA001)]
    public fun test_create_profile_success(user: signer) {
        setup(&user);
        default_profile(&user);

        let addr = signer::address_of(&user);
        assert!(profile::has_profile(addr), 0);

        let (name, bio, skills, rep, _, ipfs) = profile::get_profile(addr);
        assert!(name == utf8(b"Alice"), 1);
        assert!(bio  == utf8(b"Aptos developer"), 2);
        assert!(vector::length(&skills) == 3, 3);
        assert!(rep  == 10, 4);  // REPUTATION_PROFILE = 10
        assert!(ipfs == utf8(b"QmHash123"), 5);
    }

    // ── Test 2: has_profile returns false before creation ─────────────────────
    #[test(user = @0xA002)]
    public fun test_has_profile_false(user: signer) {
        setup(&user);
        assert!(!profile::has_profile(signer::address_of(&user)), 0);
    }

    // ── Test 3: Duplicate profile creation aborts ─────────────────────────────
    #[test(user = @0xA003)]
    #[expected_failure(abort_code = 1)] // E_PROFILE_EXISTS
    public fun test_duplicate_profile_fails(user: signer) {
        setup(&user);
        default_profile(&user);
        default_profile(&user);  // should abort
    }

    // ── Test 4: Empty name aborts ─────────────────────────────────────────────
    #[test(user = @0xA004)]
    #[expected_failure(abort_code = 3)] // E_EMPTY_NAME
    public fun test_empty_name_aborts(user: signer) {
        setup(&user);
        profile::create_profile(&user, utf8(b""), utf8(b"Bio"), vector::empty(), utf8(b""));
    }

    // ── Test 5: Update profile ────────────────────────────────────────────────
    #[test(user = @0xA005)]
    public fun test_update_profile(user: signer) {
        setup(&user);
        default_profile(&user);

        let new_skills = vector[utf8(b"Python"), utf8(b"AI")];
        profile::update_profile(&user, utf8(b"Alice Updated"), utf8(b"New bio"), new_skills, utf8(b"QmNew"));

        let addr = signer::address_of(&user);
        let (name, bio, skills, _, _, ipfs) = profile::get_profile(addr);
        assert!(name == utf8(b"Alice Updated"), 0);
        assert!(bio  == utf8(b"New bio"), 1);
        assert!(vector::length(&skills) == 2, 2);
        assert!(ipfs == utf8(b"QmNew"), 3);
    }

    // ── Test 6: Update non-existent profile aborts ────────────────────────────
    #[test(user = @0xA006)]
    #[expected_failure(abort_code = 2)] // E_PROFILE_NOT_FOUND
    public fun test_update_nonexistent_fails(user: signer) {
        setup(&user);
        profile::update_profile(&user, utf8(b"Bob"), utf8(b"Bio"), vector::empty(), utf8(b""));
    }

    // ── Test 7: Store post and check reputation ───────────────────────────────
    #[test(user = @0xA007)]
    public fun test_store_post(user: signer) {
        setup(&user);
        default_profile(&user);

        let addr = signer::address_of(&user);
        profile::store_post(&user, utf8(b"Built my first Move dApp today!"));

        assert!(profile::get_post_count(addr) == 1, 0);

        // Reputation: 10 (profile) + 5 (post) = 15
        let (_, _, _, rep, _, _) = profile::get_profile(addr);
        assert!(rep == 15, 1);
    }

    // ── Test 8: Multiple posts increment count ────────────────────────────────
    #[test(user = @0xA008)]
    public fun test_multiple_posts(user: signer) {
        setup(&user);
        default_profile(&user);

        profile::store_post(&user, utf8(b"Post 1"));
        profile::store_post(&user, utf8(b"Post 2"));
        profile::store_post(&user, utf8(b"Post 3"));

        let addr = signer::address_of(&user);
        assert!(profile::get_post_count(addr) == 3, 0);

        // 10 + (5*3) = 25
        let (_, _, _, rep, _, _) = profile::get_profile(addr);
        assert!(rep == 25, 1);
    }

    // ── Test 9: Post without profile aborts ───────────────────────────────────
    #[test(user = @0xA009)]
    #[expected_failure(abort_code = 2)] // E_PROFILE_NOT_FOUND
    public fun test_post_without_profile_fails(user: signer) {
        setup(&user);
        profile::store_post(&user, utf8(b"No profile yet"));
    }

    // ── Test 10: Update reputation ────────────────────────────────────────────
    #[test(user = @0xA010)]
    public fun test_update_reputation(user: signer) {
        setup(&user);
        default_profile(&user);

        profile::update_reputation(&user, 20); // AI detected skills
        profile::update_reputation(&user, 30); // Verified achievement

        let addr = signer::address_of(&user);
        let (_, _, _, rep, _, _) = profile::get_profile(addr);
        assert!(rep == 60, 0); // 10 + 20 + 30
    }

    // ── Test 11: Zero reputation points aborts ────────────────────────────────
    #[test(user = @0xA011)]
    #[expected_failure(abort_code = 8)] // E_ZERO_POINTS
    public fun test_zero_reputation_aborts(user: signer) {
        setup(&user);
        default_profile(&user);
        profile::update_reputation(&user, 0);
    }

    // ── Test 12: get_posts returns correct data ───────────────────────────────
    #[test(user = @0xA012)]
    public fun test_get_posts(user: signer) {
        setup(&user);
        default_profile(&user);
        profile::store_post(&user, utf8(b"Hello, Aptos!"));

        let addr = signer::address_of(&user);
        let posts = profile::get_posts(addr);
        assert!(vector::length(&posts) == 1, 0);
    }
}
