function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function attackAction(rollWorkflow, targetToken) {
    window.myAttackHookCounter++;

    if (window.myAttackHookCounter > 1) {
        return
    }

    let choice = getRandomInt(4)
    let usedText = "default";
    let textArraySuccess = [
        "For justice!",
        `Justice demands retribution!`,
        "Fall by my hand!",
        "You must obey!",
    ]
    let textArrayFail = [
        "I loathe mistakes!",
        "A blunder."
    ]

    if (rollWorkflow.hasOwnProperty("damageTotal")) {
        usedText = textArraySuccess[choice]
        if (choice > 1) {
            AudioHelper.play({ src: `uploads/sounds/Attack${choice + 1}.wav`, volume: 0.4, autoplay: true, loop: false }, true);
        }
        else {
            AudioHelper.play({ src: `uploads/sounds/Attack${choice + 1}.ogg`, volume: 0.4, autoplay: true, loop: false }, true);
        }
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${usedText}`
        }, { chatBubble: true });
        await new Promise(r => setTimeout(r, 1500));
        animAttack(targetToken, "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/", "Javelin01_01_Regular_White_30ft_1600x400.webm", 1, 1, 0.475, 0.5)
        await new Promise(r => setTimeout(r, 500));
        AudioHelper.play({ src: "uploads/sounds/HolyDamage.ogg", volume: 0.4, autoplay: true, loop: false }, true);
        animAttack(targetToken, "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Melee/", "DmgSlashing_01_Regular_Yellow_2Handed_800x600.webm", 1, 1, 0.625, 0.5)

    }
    else {
        let choiceFail = getRandomInt(2)
        usedText = textArrayFail[choiceFail]
        animAttack(targetToken, "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Ranged/", "Javelin01_01_Regular_White_30ft_1600x400.webm", 1, 1, 0.475, 0.475)
        await new Promise(r => setTimeout(r, 500));
        animAttack(targetToken, "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Melee/", "DmgSlashing_01_Regular_Yellow_1Handed_800x600.webm", 1, 1, 0.625, 0.75)
        await new Promise(r => setTimeout(r, 1000));
        AudioHelper.play({ src: `uploads/sounds/HitMiss${choiceFail + 1}.wav`, volume: 0.4, autoplay: true, loop: false }, true);
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${usedText}`
        }, { chatBubble: true });
    }

    window.myAttackHookCounter = 0;
}

let animAttack = function (targetToken, folder, animType, scaleX = 1, scaleY = 1, anchorX = 0.5, anchorY = 0.5) {

    //This macro plays the animation on selected targets with no trajectory
    //It works for animations like Cure Wounds, Healing Ability and Dizzy Stars 
    //Import this macro, duplicate it and change its name making sure it's unique by adding the colour (i.e. "Cure Wounds Blue").
    //If it has the exact same name as the spell or item you want to trigger it from, you'll encounter an issue.
    //anFile is the name of the file used for the animation
    let anFile = `${folder}${animType}`;
    //another example would be:
    //let folder01 = "modules/jb2a_patreon/Library/Generic/Healing/"
    //let anFile = `${folder01}HealingAbility_01_Green_200x200.webm`;
    ///Check if Module dependencies are installed or returns an error to the user
    if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");
    if (game.user.targets.size == 0) {
        targetToken.setTarget(true, canvas.tokens.controlled[0], false, false)
    }

    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    async function Cast() {
        var myStringArray = Array.from(game.user.targets)[0];
        var arrayLength = game.user.targets.size;
        for (var i = 0; i < arrayLength; i++) {

            let mainTarget = Array.from(game.user.targets)[i];

            let spellAnim =
            {
                file: anFile,
                position: mainTarget.center,
                anchor: {
                    x: anchorX,
                    y: anchorY
                },
                angle: 0,
                scale: {
                    x: scaleX,
                    y: scaleY
                }
            };
            canvas.fxmaster.playVideo(spellAnim);
            game.socket.emit('module.fxmaster', spellAnim);
            await wait(75);
        }
    }
    Cast()

}

async function attackMain(weaponUsed) {
    // if we close the dialog we will have hook hanging, calling this function will then result in two unprocessed hooks
    // this simple global counter is set here and then later used in attackAction() method
    // if we query multiple attacks but close the popup windows, we would get that many animations on next successful hook
    // therefore we increment number of hooks that are waiting to play animation and if it's above 1, they return nothing and are discarded
    // result is only 1 animation and 1 sound will play
    // NOTE: there is probably an easier way to do this but I have no idea how, feel free to branch about and submit a proper fix
    if (typeof window.myAttackHookCounter === 'undefined') {
        window.myAttackHookCounter = 0;
    }

    if (game.user.targets.size !== 1) {
        ui.notifications.warn(`Please target one token.`);
        return
    }

    if (game.user.targets.values().next().value.actor.data.data.attributes.hp.value === 0) {
        let textArrayTargetDead = [
            "My steel is no longer needed here.",
            "I can't attack something that's already dead...",
            "This one has seen better days."
        ]
        AudioHelper.play({ src: `uploads/sounds/Error1.ogg`, volume: 0.4, autoplay: true, loop: false }, true);
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${textArrayTargetDead[getRandomInt(3)]}`
        }, { chatBubble: true });
        return
    }

    let targetToken = game.user.targets.values().next().value
    game.dnd5e.rollItemMacro(weaponUsed);
    Hooks.once("midi-qol.RollComplete", (workflow) => { attackAction(workflow, targetToken) })
}

///************* How to use:****************************
///   Switch "Javelin" to any weapon you are going to use that is in your inventory
///   Edit animations and sounds to fit the weapon style or comment them out, 
///   default is javelin throw with some smity effeects from jb2a and CUSTOM paladin voice lines, you have to upload yours or nothing will play
///
attackMain("Javelin");