function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let animAction = function (targetToken, folder, animType, scaleX = 1, scaleY = 1, anchorX = 0.5, anchorY = 0.5) {
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

    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    async function Cast() {
        for (var i = 0; i < 1; i++) {
            let mainTarget = targetToken;

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

async function divine_sense() {
    if (!canvas.tokens.controlled[0]) {
        ui.notifications.warn(`Please make sure you are controlling your token.`);
        return
    }

    let senseSuccessFoul = [
        "I sense something foul!",
        "My senses warn me of evil lurking nearby.",
        "Something is not quite right."
    ]

    let senseSuccessGood = [
        "What is this divine presence?!",
        "I am sensing something pure."
    ]

    let senseSuccessMix = [
        "I sense something unusual.",
        "Hmmm....",
        "Be wary."
    ]

    let senseFail = [
        "My senses have failed me.",
        "I feel nothing.",
        "Light is absent."
    ]

    let flavor = "default"
    let choice = 0;

    let tokenData = canvas.tokens.controlled[0]
    let actorData = tokenData.actor
    let featData = actorData ? actorData.items.find(i => i.name === "Divine Sense") : null;
    let featUpdate = duplicate(featData);

    ChatMessage.create({
        user: game.user._id,
        content: `${actorData.data.name} is using Divine Sense`,
        whisper: ChatMessage.getWhisperRecipients("Gamemaster"),
    });

    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `<div class="dnd5e chat-card item-card midi-qol-item-card" data-actor-id=${actorData} data-item-id=${featData.id}>
                    <header class="card-header flexrow">
                        <img src="systems/dnd5e/icons/skills/light_02.jpg" title="Divine Sense" width="36" height="36">
                        <h3 class="item-name">Divine Sense</h3>
                    </header>
                    <div class="card-content" style="display: block;">
                        <div class="rd__b  rd__b--3"><p>The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You know the type (celestial, fiend, or undead) of any being whose presence you sense, but not its identity (the vampire Count Strahd von Zarovich, for instance). Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the <a href="https://5e.tools/spells.html#hallow_phb">hallow</a> spell.</p><div class="rd__spc-inline-post"></div><p>You can use this feature a number of times equal to 1 + your Charisma modifier. When you finish a long rest, you regain all expended uses.</p></div>
                    </div>
                    <footer class="card-footer">
                        <span>Paladin 1</span>
                        <span>1 Action</span>
                        <span>60 Feet</span>
                        <span>1 Rounds</span>
                    </footer>
                    </div>`
    });

    if (featUpdate.data.uses.value <= 0) {
        let textArrayCant = [
            "I need to regain my strength.",
            "I need some time to rest.",
            "My senses are dull."
        ]
        AudioHelper.play({ src: `uploads/sounds/Error1.ogg`, volume: 0.3, autoplay: true, loop: false }, true);
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${textArrayCant[getRandomInt(3)]}`
        }, { chatBubble: true });
        return
    }

    featUpdate.data.uses.value = featUpdate.data.uses.value - 1;
    actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
    let i;
    let evilPresence = false;
    let goodPresence = false;
    let sensable = true;
    
    for (i = 0; i < canvas.tokens.placeables.length; i++) {
        let currentToken = canvas.tokens.placeables[i]
        let currentTokenType = null;
        if (currentToken.actor != null) {
            sensable = currentToken.actor.effects.entries.find(entry => entry.data.label === "Sensable");
            currentTokenType = currentToken.actor.data.data.details.type
        } else {
            continue;
        }
        if (currentTokenType) {
            let distanceBetween = canvas.grid.measureDistance(tokenData, currentToken)
            let collisionBetween = canvas.walls.checkCollision(new Ray(tokenData, currentToken))
            if ((currentToken.isVisible || sensable) && !collisionBetween && distanceBetween <= 60 && (currentTokenType.includes("undead") || currentTokenType.includes("celestial") || currentTokenType.includes("fiend"))) {

                ChatMessage.create({
                    user: game.user._id,
                    content: `${currentTokenType}`,
                    whisper: ChatMessage.getWhisperRecipients("Gamemaster"),
                });

                if (currentTokenType.includes("undead")) {
                    evilPresence = true

                }
                else if (currentTokenType.includes("celestial")) {
                    goodPresence = true

                }
                else if (currentTokenType.includes("fiend")) {
                    evilPresence = true

                }
            }
        }
    }

    if (!evilPresence && !goodPresence) {
        choice = getRandomInt(3)
        flavor = `<strong>${senseFail[choice]}</strong><br>`
    }
    else if (evilPresence && goodPresence) {
        choice = getRandomInt(3)
        flavor = `<strong>${senseSuccessMix[choice]}</strong><br>`

    }
    else if (evilPresence && !goodPresence) {
        choice = getRandomInt(3)
        flavor = `<strong>${senseSuccessFoul[choice]}</strong><br>`
    }
    else if (!evilPresence && goodPresence) {
        choice = getRandomInt(2)
        flavor = `<strong>${senseSuccessGood[choice]}</strong><br>`
    }

    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `${flavor}`
    }, { chatBubble: true });

    choice = getRandomInt(3)
    AudioHelper.play({ src: `uploads/sounds/Thinking${choice + 1}.ogg`, volume: 0.3, autoplay: true, loop: false }, true);
    await new Promise(r => setTimeout(r, 1000));
    animAction(tokenData, "modules/jb2a_patreon/Library/Generic/Magic_Signs/", "Divination_01_Light_Blue_Circle_800x800.webm", 0.75, 0.75)
    AudioHelper.play({ src: `uploads/sounds/DivineSense.ogg`, volume: 0.3, autoplay: true, loop: false }, true);
}

divine_sense()