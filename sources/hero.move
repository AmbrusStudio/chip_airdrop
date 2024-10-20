module demon_hunter::hero {
    use std::bcs;
    use std::string;
    use sui::tx_context::{sender, TxContext};
    use std::string::{utf8, String};
    use sui::transfer;
    use sui::object::{Self, UID};
    use demon_hunter::verification::{Self, Verifier};

    // The creator bundle: these two packages often go together.
    use sui::package;
    use sui::display::{ Self,Display};

    const MODULE_NAME: vector<u8> = b"hero";
    const MINT_FUNCTION_NAME: vector<u8> = b"mint";

    public struct Hero has key {
        id: UID,
        name: String,
        image_url: String,
        media_url:String,
        media_type: String,
        description: String,
    }

    public struct HERO  has drop{
    }


    #[test_only]
    public fun createHero(ctx: &mut TxContext){
        init(HERO{},ctx);
    }
    fun init(otw: HERO, ctx: &mut TxContext) {
    let keys = vector[
    utf8(b"name"),
    utf8(b"media_url"),
        utf8(b"image_url"),
        utf8(b"media_type"),
    utf8(b"description"),
    utf8(b"project_url"),

    ];

    let values = vector[
    // For `name` we can use the `Hero.name` property
    utf8(b"E4C Chip Collector"),
    // For `img_url` we use.
    utf8(b"https://cdn.ambrus.studio/NFTs/Diamond_Chip.mp4"),
        utf8(b"https://cdn.ambrus.studio/NFTs/Diamond_Chip-ezgif.com-video-to-gif-converter.gif"),
     utf8(b"video/mp4"),
    // Description is static for all `Hero` objects.
    utf8(b"Awesome news! You've snagged your very first E4C Quest Chip! Hold on tight—these chips are more than just cool collectibles. Keep them close, and soon you'll unlock exciting rewards with $E4C tokens!"),
    // Project URL is usually static
    utf8(b"https://www.ambrus.studio/#/"),
    ];

    // Claim the `Publisher` for the package!
    let publisher = package::claim(otw, ctx);

    // Get a new `Display` object for the `Hero` type.
    let mut display = display::new_with_fields<Hero>(
    &publisher, keys, values, ctx
    );

    // Commit first version of `Display` to apply changes.
    display::update_version(&mut display);

    transfer::public_transfer(publisher, sender(ctx));
    transfer::public_transfer(display, sender(ctx));
    }
    public entry fun mint(
        verifier: &mut Verifier,
        signature: vector<u8>,
        ctx: &mut TxContext) {
        let id = object::new(ctx);
        let name =  utf8(b"E4C Chip Collector");
        let mut msg = vector<u8>[];
        msg.append(bcs::to_bytes(&string::utf8(MODULE_NAME)));
        msg.append(bcs::to_bytes(&string::utf8(MINT_FUNCTION_NAME)));
        msg.append(ctx.sender().to_bytes());
        verification::verify_signature(verifier, ctx.sender(), signature, &mut msg);
        let hero= Hero { id, name, media_url: utf8(b"https://cdn.ambrus.studio/NFTs/Diamond_Chip.mp4"),
            image_url: utf8(b"https://cdn.ambrus.studio/NFTs/Diamond_Chip-ezgif.com-video-to-gif-converter.gif"),
        media_type: utf8(b"video/mp4"),
        description: utf8(b"Awesome news! You've snagged your very first E4C Quest Chip! Hold on tight—these chips are more than just cool collectibles. Keep them close, and soon you'll unlock exciting rewards with $E4C tokens!")};
        transfer::transfer(hero, sender(ctx));
    }


}
