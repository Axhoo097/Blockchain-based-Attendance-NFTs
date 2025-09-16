module MyModule::AttendanceNFT {
    use aptos_framework::signer;
    use std::string::{Self, String};
    use std::vector;

    /// Struct representing an attendance NFT record
    struct AttendanceRecord has store, key {
        event_name: String,           // Name of the event attended
        attendance_date: u64,         // Timestamp of attendance
        attendee_count: u64,          // Total number of attendees for this address
    }

    /// Collection to store multiple attendance NFTs for a user
    struct AttendanceCollection has store, key {
        records: vector<AttendanceRecord>,  // Vector of attendance records
        total_events: u64,                  // Total events attended by this user
    }

    /// Function to initialize attendance collection for a new user
    public fun initialize_attendance(user: &signer) {
        let collection = AttendanceCollection {
            records: vector::empty<AttendanceRecord>(),
            total_events: 0,
        };
        move_to(user, collection);
    }

    /// Function to mint attendance NFT when user attends an event
    public fun mint_attendance_nft(
        user: &signer, 
        event_name: String, 
        attendance_date: u64
    ) acquires AttendanceCollection {
        let user_addr = signer::address_of(user);
        
        // Check if collection exists, if not initialize it
        if (!exists<AttendanceCollection>(user_addr)) {
            initialize_attendance(user);
        };
        
        let collection = borrow_global_mut<AttendanceCollection>(user_addr);
        
        // Create new attendance record
        let new_record = AttendanceRecord {
            event_name,
            attendance_date,
            attendee_count: collection.total_events + 1,
        };
        
        // Add record to collection and update totals
        vector::push_back(&mut collection.records, new_record);
        collection.total_events = collection.total_events + 1;
    }
}