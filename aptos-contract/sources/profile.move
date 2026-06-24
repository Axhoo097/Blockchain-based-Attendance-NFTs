/// ChainProfile AI — On-chain Identity & Reputation Module
///
/// This module manages user profiles, posts, and reputation scores on the
/// Aptos blockchain. It is the source of truth for all identity data in the
/// ChainProfile AI platform.
///
/// Key design decisions:
///   - Profile is stored as a resource under the user's own account address
///   - PostList is a separate resource allowing independent initialization
///   - Reputation is an accumulator — points are only ever added, never subtracted
///   - Events are emitted for every state change for off-chain indexing
module ChainProfile::profile {
    use std::string::{String, utf8, length};
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // ── Error Codes ──────────────────────────────────────────────────────────────
    const E_PROFILE_EXISTS:     u64 = 1;
    const E_PROFILE_NOT_FOUND:  u64 = 2;
    const E_EMPTY_NAME:         u64 = 3;
    const E_BIO_TOO_LONG:       u64 = 4;
    const E_EMPTY_CONTENT:      u64 = 5;
    const E_CONTENT_TOO_LONG:   u64 = 6;
    const E_NAME_TOO_LONG:      u64 = 7;
    const E_ZERO_POINTS:        u64 = 8;

    // ── Constants ─────────────────────────────────────────────────────────────────
    const MAX_NAME_LENGTH:    u64 = 100;
    const MAX_BIO_LENGTH:     u64 = 500;
    const MAX_CONTENT_LENGTH: u64 = 1000;
    const MAX_SKILLS:         u64 = 20;
    const REPUTATION_PROFILE: u64 = 10;   // points on profile creation
    const REPUTATION_POST:    u64 = 5;    // points per post

    // ── Resources ─────────────────────────────────────────────────────────────────

    /// Primary user profile resource. Stored under the user's account address.
    struct Profile has key {
        name:            String,
        bio:             String,
        skills:          vector<String>,
        reputation:      u64,
        created_at:      u64,
        ipfs_hash:       String,  // IPFS CID for profile image/data
        profile_events:  event::EventHandle<ProfileEvent>,
    }

    /// Stores all posts created by a user. Kept separate from Profile
    /// to avoid bloating the Profile resource.
    struct PostList has key {
        posts:       vector<Post>,
        post_events: event::EventHandle<PostEvent>,
    }

    /// An individual post. Uses `copy` so it can be returned from view functions.
    struct Post has store, drop, copy {
        content:           String,
        timestamp:         u64,
        reputation_gained: u64,
    }

    // ── Events ────────────────────────────────────────────────────────────────────

    struct ProfileEvent has drop, store {
        action:    String,  // "created" | "updated"
        timestamp: u64,
    }

    struct PostEvent has drop, store {
        content:   String,
        timestamp: u64,
    }

    struct ReputationEvent has drop, store {
        points_added: u64,
        new_total:    u64,
        timestamp:    u64,
    }

    // ── Write Functions ───────────────────────────────────────────────────────────

    /// Create a new on-chain profile for the calling account.
    /// Awards +10 reputation points automatically.
    /// Aborts if: profile already exists, name is empty/too long, bio is too long.
    public entry fun create_profile(
        account: &signer,
        name: String,
        bio: String,
        skills: vector<String>,
        ipfs_hash: String,
    ) {
        let addr = signer::address_of(account);

        // Validation
        assert!(!exists<Profile>(addr),               E_PROFILE_EXISTS);
        assert!(length(&name) > 0,                    E_EMPTY_NAME);
        assert!(length(&name) <= MAX_NAME_LENGTH,     E_NAME_TOO_LONG);
        assert!(length(&bio) <= MAX_BIO_LENGTH,       E_BIO_TOO_LONG);

        let mut profile = Profile {
            name,
            bio,
            skills,
            reputation:     REPUTATION_PROFILE,
            created_at:     timestamp::now_seconds(),
            ipfs_hash,
            profile_events: account::new_event_handle<ProfileEvent>(account),
        };

        event::emit_event(&mut profile.profile_events, ProfileEvent {
            action:    utf8(b"created"),
            timestamp: timestamp::now_seconds(),
        });

        move_to(account, profile);

        // Initialize PostList eagerly alongside profile
        if (!exists<PostList>(addr)) {
            move_to(account, PostList {
                posts:       vector::empty<Post>(),
                post_events: account::new_event_handle<PostEvent>(account),
            });
        };
    }

    /// Update an existing profile. Only the profile owner can call this.
    public entry fun update_profile(
        account: &signer,
        name: String,
        bio: String,
        skills: vector<String>,
        ipfs_hash: String,
    ) acquires Profile {
        let addr = signer::address_of(account);

        assert!(exists<Profile>(addr),            E_PROFILE_NOT_FOUND);
        assert!(length(&name) > 0,                E_EMPTY_NAME);
        assert!(length(&name) <= MAX_NAME_LENGTH, E_NAME_TOO_LONG);
        assert!(length(&bio) <= MAX_BIO_LENGTH,   E_BIO_TOO_LONG);

        let profile = borrow_global_mut<Profile>(addr);
        profile.name      = name;
        profile.bio       = bio;
        profile.skills    = skills;
        profile.ipfs_hash = ipfs_hash;

        event::emit_event(&mut profile.profile_events, ProfileEvent {
            action:    utf8(b"updated"),
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Store a new post. Requires an existing profile.
    /// Awards +5 reputation automatically.
    public entry fun store_post(
        account: &signer,
        content: String,
    ) acquires Profile, PostList {
        let addr = signer::address_of(account);

        assert!(exists<Profile>(addr),                  E_PROFILE_NOT_FOUND);
        assert!(length(&content) > 0,                   E_EMPTY_CONTENT);
        assert!(length(&content) <= MAX_CONTENT_LENGTH, E_CONTENT_TOO_LONG);

        // Ensure PostList exists (may not exist for very old profiles)
        if (!exists<PostList>(addr)) {
            move_to(account, PostList {
                posts:       vector::empty<Post>(),
                post_events: account::new_event_handle<PostEvent>(account),
            });
        };

        let post = Post {
            content,
            timestamp:         timestamp::now_seconds(),
            reputation_gained: REPUTATION_POST,
        };

        let post_list = borrow_global_mut<PostList>(addr);
        event::emit_event(&mut post_list.post_events, PostEvent {
            content:   post.content,
            timestamp: post.timestamp,
        });
        vector::push_back(&mut post_list.posts, post);

        // Award reputation for the post
        let profile = borrow_global_mut<Profile>(addr);
        profile.reputation = profile.reputation + REPUTATION_POST;
    }

    /// Add reputation points to a profile.
    /// Called by the user after AI analysis confirms technical skills.
    /// Points must be non-zero; only adds, never subtracts.
    public entry fun update_reputation(
        account: &signer,
        additional_points: u64,
    ) acquires Profile {
        let addr = signer::address_of(account);

        assert!(exists<Profile>(addr),    E_PROFILE_NOT_FOUND);
        assert!(additional_points > 0,    E_ZERO_POINTS);

        let profile = borrow_global_mut<Profile>(addr);
        profile.reputation = profile.reputation + additional_points;
    }

    // ── View Functions ────────────────────────────────────────────────────────────

    /// Returns true if an on-chain profile exists for the given address.
    #[view]
    public fun has_profile(addr: address): bool {
        exists<Profile>(addr)
    }

    /// Returns all profile fields as a tuple.
    /// (name, bio, skills, reputation, created_at, ipfs_hash)
    #[view]
    public fun get_profile(addr: address): (String, String, vector<String>, u64, u64, String)
    acquires Profile {
        assert!(exists<Profile>(addr), E_PROFILE_NOT_FOUND);
        let p = borrow_global<Profile>(addr);
        (p.name, p.bio, p.skills, p.reputation, p.created_at, p.ipfs_hash)
    }

    /// Returns only the reputation score for a given address.
    #[view]
    public fun get_reputation(addr: address): u64 acquires Profile {
        assert!(exists<Profile>(addr), E_PROFILE_NOT_FOUND);
        borrow_global<Profile>(addr).reputation
    }

    /// Returns number of posts created by the address.
    #[view]
    public fun get_post_count(addr: address): u64 acquires PostList {
        if (!exists<PostList>(addr)) return 0;
        vector::length(&borrow_global<PostList>(addr).posts)
    }

    /// Returns all posts for an address.
    #[view]
    public fun get_posts(addr: address): vector<Post> acquires PostList {
        if (!exists<PostList>(addr)) return vector::empty<Post>();
        *&borrow_global<PostList>(addr).posts
    }

    // ── Inline Tests ──────────────────────────────────────────────────────────────

    #[test(admin = @0x1234)]
    public fun test_create_profile(admin: signer) acquires Profile, PostList {
        account::create_account_for_test(signer::address_of(&admin));
        timestamp::set_time_has_started_for_testing(&admin);

        let skills = vector[utf8(b"Move"), utf8(b"Rust")];
        create_profile(&admin, utf8(b"Alice"), utf8(b"Aptos developer"), skills, utf8(b""));

        assert!(has_profile(signer::address_of(&admin)), 0);
        let (name, _, _, rep, _, _) = get_profile(signer::address_of(&admin));
        assert!(name == utf8(b"Alice"), 1);
        assert!(rep == REPUTATION_PROFILE, 2);
    }

    #[test(admin = @0x1234)]
    #[expected_failure(abort_code = E_PROFILE_EXISTS)]
    public fun test_duplicate_profile_fails(admin: signer) acquires Profile, PostList {
        account::create_account_for_test(signer::address_of(&admin));
        timestamp::set_time_has_started_for_testing(&admin);
        create_profile(&admin, utf8(b"Alice"), utf8(b"Bio"), vector::empty(), utf8(b""));
        create_profile(&admin, utf8(b"Alice"), utf8(b"Bio"), vector::empty(), utf8(b""));
    }

    #[test(admin = @0x1234)]
    #[expected_failure(abort_code = E_EMPTY_NAME)]
    public fun test_empty_name_fails(admin: signer) acquires Profile, PostList {
        account::create_account_for_test(signer::address_of(&admin));
        timestamp::set_time_has_started_for_testing(&admin);
        create_profile(&admin, utf8(b""), utf8(b"Bio"), vector::empty(), utf8(b""));
    }
}
