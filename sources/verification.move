// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
module demon_hunter::verification {
    use std::bcs;
    use sui::ecdsa_k1;
    use sui::table::{Self, Table};

    
    const SIG_THRESHOLD_SEC: u64 = 10 * 60;
    const EInvalidOrExpiredSig: u64 = 0;
    const EVersionMismatch: u64 = 1;
    
    /// [Shared Object] Verifier is an object that holds the public keys and the counter for each user.
    public struct Verifier has key {
        id: UID,
        /// pub_key is used to verify the signature. The schema should be the secp256k1.
        pub_key: vector<u8>,
        /// counter is a dynamic field to keep track of the number of times a user has executed an authentificated action.
        /// The counter is incremented each time the user executes the action.
        /// Ambrus will fetch and include the current value in the signature when sending a transaction.
        /// Then the verification function will check the signature and the value is the same as the one stored.
        /// The counter is used to prevent replay attacks.
        counter: Table<address, u64>
    }
    
    /// [Owned Object] VerifierCap is an admin object that holds the capability to modify the Verifier object.
    public struct VerifierCap has key, store { id: UID }
    
    /// Initializes the Verifier object.
    fun init(ctx: &mut TxContext) {
        transfer::share_object(Verifier {
            id: object::new(ctx),
            pub_key: vector<u8>[],
            counter: table::new(ctx),
        });
        transfer::public_transfer(
            VerifierCap { id: object::new(ctx) },
            ctx.sender()
        );
    }
    
    /// Verifies the signature and increments the counter value.
    public(package) fun verify_signature(
        verifier: &mut Verifier,
        sender: address,
        signature: vector<u8>,
        msg: &mut vector<u8>
    ): bool {
        if (!verifier.is_contained(sender)) {
            verifier.counter.add(sender, 0);
        };
        let value = verifier.counter.borrow_mut(sender);
        // append the counter value to the message
        msg.append(bcs::to_bytes(value));
        let verified = internal_verify_signature(verifier.pub_key, signature, msg);
        assert!(verified, EInvalidOrExpiredSig);
        // increment the counter value
        *value = *value + 1;
        verified
    }
    
    /// TODO: Unify the verification functions.
    fun internal_verify_signature(
        pub_key: vector<u8>,
        signature: vector<u8>,
        msg: &mut vector<u8>,
    ): bool {
          ecdsa_k1::secp256k1_verify(&signature, &pub_key, msg, 1)
    }
    
    /// Overwrites the public key used for signature verification.
    public fun overwrite_pub_key(_: &VerifierCap, verifier: &mut Verifier, pub_key: vector<u8>) {
        verifier.pub_key = pub_key;
    }

    
    public fun pub_key(self: &Verifier): vector<u8> { self.pub_key }
    
    public fun counter_value(self: &Verifier, user: address): u64 {
        if (!self.is_contained(user)) {
            0
        } else {
            *self.counter.borrow(user)
        }
    }
    
    public fun is_contained(self: &Verifier, user: address): bool { self.counter.contains(user) }
    
    #[test_only] public fun init_for_testing(ctx: &mut TxContext) { init(ctx); }
    #[test_only] public fun counter_value_setting_for_testing(verifier: &mut Verifier, address: address, changed_value: u64) { *verifier.counter.borrow_mut(address) = changed_value;}
}

