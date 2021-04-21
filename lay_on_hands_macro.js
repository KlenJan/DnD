let lay_on_hands_heal = function () {

    let confirmed = false;
    let tokenData = token;
    let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;
    let featUpdate = duplicate(featData);
    let targetActor = game.user.targets.values().next().value.actor;
    let maxHeal = Math.clamped(featUpdate.data.uses.value, 0,
        targetActor.data.data.attributes.hp.max - targetActor.data.data.attributes.hp.value);

    let content = `<p><em>${actorData.name} lays hands on ${targetActor.data.name}.</em></p>
                             <p>How many HP do you want to restore to ${targetActor.data.name}?</p>
                             <p>Pool of Holy Power: ${featUpdate.data.uses.value}</p>
                             <form>
                                 <div class="form-group">
                                     <label for="num">HP to Restore: (Max = ${maxHeal})</label>
                                     <input id="num" name="num" type="number" min="0" max="${maxHeal}"></input>
                                 </div>
                             </form>`;
    new Dialog({
        title: "Lay on Hands Healing",
        content: content,
        buttons: {
            heal: { label: "Heal!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        default: "heal",

        close: html => {
            if (confirmed) {
                let number = Math.floor(Number(html.find('#num')[0].value));
                if (number < 1 || number > maxHeal || (targetActor.data.data.details.race === "Undead" || targetActor.data.data.details.race === "Construct") || (targetActor.data.data.details.type === "undead" || targetActor.data.data.details.type === "construct")) {
                    AudioHelper.play({ src: `uploads/sounds/Error1.ogg`, volume: 0.8, autoplay: true, loop: false }, true);
                    let textArray = [
                        `Light does not answer my calls. I can't heal you ${targetActor.name}.`,
                        "Light does not answer my calls. I am unable to heal myself.",
                        "I am unable to heal such a foul creature!"
                    ]

                    let choice = 0

                    if (actorData === targetActor) {
                        choice = 1
                    }
                    else if (targetActor.data.data.details.race === "Undead" || targetActor.data.data.details.race === "Construct" || targetActor.data.data.details.type === "undead" || targetActor.data.data.details.type === "construct") {
                        choice = 2
                    }

                    let flavor = `<strong>${textArray[choice]}</strong><br>`
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker(),
                        content: `${flavor}`
                    }, { chatBubble: true });

                }
                else {
                    let textArray = [
                        "By the holy light!",
                        "May the light grant you peace.",
                        "Light surges!",
                        `Let the light heal you, ${targetActor.name}.`,
                        "Feel the embrace of light."
                    ]
                    let choice = getRandomInt(5);
                    let soundChoiceDefault = getRandomInt(2);
                    if (choice <= 1) {
                        soundChoiceDefault = choice
                    }
                    let flavor = `<strong>${textArray[choice]}</strong><br>`

                    if (targetActor.permission !== CONST.ENTITY_PERMISSIONS.OWNER) {
                        // We need help applying the healing, so make a roll message for right-click convenience.
                        let creatureStart = targetActor.data.name.indexOf("(")
                        let creatureEnd = targetActor.data.name.indexOf(")")
                        let realActorName = targetActor.data.name
                        if (creatureStart >= 0 && creatureEnd >= 0 && creatureEnd > creatureStart) {
                            realActorName = targetActor.data.name.substring(creatureStart + 1, creatureEnd)
                        }
                        ChatMessage.create({
                            speaker: ChatMessage.getSpeaker(),
                            content: `${flavor}`
                        }, { chatBubble: true });
                        new Roll(`${number}`).roll().toMessage({
                            speaker: ChatMessage.getSpeaker(),
                            flavor: `${actorData.name} lays hands on ${realActorName}.<br>
                                     <p><br><em>Manually apply ${number} HP of healing to ${realActorName}</em></p>`
                        });
                        choice = getRandomInt(2)
                        AudioHelper.play({ src: `uploads/sounds/HolyLight${soundChoiceDefault + 1}.wav`, volume: 0.8, autoplay: true, loop: false }, true);
                        var_anim_heal()
                        AudioHelper.play({ src: "uploads/sounds/LayOnHands.ogg", volume: 0.5, autoplay: true, loop: false }, true);


                    }
                    else {
                        // We can apply healing automatically, so just show a normal chat message.
                        ChatMessage.create({
                            speaker: ChatMessage.getSpeaker(),
                            content: `${flavor}`
                        }, { chatBubble: true });
                        ChatMessage.create({
                            speaker: ChatMessage.getSpeaker(),
                            content: `${actorData.name} lays hands on ${targetActor.data.name} for ${number} HP.`
                        });
                        targetActor.update({ "data.attributes.hp.value": targetActor.data.data.attributes.hp.value + number });
                        choice = getRandomInt(2)
                        AudioHelper.play({ src: `uploads/sounds/HolyLight${soundChoiceDefault + 1}.wav`, volume: 0.8, autoplay: true, loop: false }, true);
                        var_anim_heal()
                        AudioHelper.play({ src: "uploads/sounds/LayOnHands.ogg", volume: 0.8, autoplay: true, loop: false }, true);


                    }

                    featUpdate.data.uses.value = featUpdate.data.uses.value - number;
                    actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
                };
            }
        }
    }).render(true);


}

let lay_on_hands_cure = function (ailmentType) {

    let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;
    let featUpdate = duplicate(featData);
    let targetActor = game.user.targets.values().next().value.actor;

    if (featUpdate.data.uses.value < 5 || (targetActor.data.data.details.race === "Undead" || targetActor.data.data.details.race === "Construct") || (targetActor.data.data.details.type === "undead" || targetActor.data.data.details.type === "construct")) {
        AudioHelper.play({ src: `uploads/sounds/Error1.ogg`, volume: 0.8, autoplay: true, loop: false }, true);
        let textArray = [
            `Light does not answer my calls. I can't cure your ${ailmentType} ${targetActor.name}.`,
            "Light does not answer my calls. I am unable to cure myself.",
            "I am unable to cure such a foul creature!"
        ]
        let choice = 0

        if (actorData === targetActor) {
            choice = 1
        }
        else if (targetActor.data.data.details.race === "Undead" || targetActor.data.data.details.race === "Construct" || targetActor.data.data.details.type === "undead" || targetActor.data.data.details.type === "construct") {
            choice = 2
        }
        let flavor = `<strong>${textArray[choice]}</strong><br>`
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${flavor}`
        }, { chatBubble: true });

    }
    else {
        let textArray = [
            "Purity!",
            `You have been cleansed of ${ailmentType}!`,
            `Let the light cleanse you, ${targetActor.name}.`
        ]
        let choice = getRandomInt(3);
        let flavor = `<strong>${textArray[choice]}</strong><br>`

        if (targetActor.permission !== CONST.ENTITY_PERMISSIONS.OWNER) {
            let creatureStart = targetActor.data.name.indexOf("(")
            let creatureEnd = targetActor.data.name.indexOf(")")
            let realActorName = targetActor.data.name
            if (creatureStart >= 0 && creatureEnd >= 0 && creatureEnd > creatureStart) {
                realActorName = targetActor.data.name.substring(creatureStart + 1, creatureEnd)
            }

            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                content: `${flavor}`
            }, { chatBubble: true });
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                content: `${actorData.name} lays hands on ${realActorName} and cleanses <em>${ailmentType}</em>.
                <p><br><em>Manually cleanse ${ailmentType} from ${realActorName}</em></p>`
            });
            AudioHelper.play({ src: `uploads/sounds/Purity.wav`, volume: 0.8, autoplay: true, loop: false }, true);
            var_anim_cure_poison()
            AudioHelper.play({ src: "uploads/sounds/LayOnHandsCure.ogg", volume: 0.8, autoplay: true, loop: false }, true);


        }
        else {
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                content: `${flavor}`
            }, { chatBubble: true });
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker(),
                content: `${actorData.name} lays hands on ${targetActor.data.name} and cleanses <em>${ailmentType}</em>.`
            });
            AudioHelper.play({ src: `uploads/sounds/Purity.wav`, volume: 0.8, autoplay: true, loop: false }, true);
            var_anim_cure_poison()
            AudioHelper.play({ src: "uploads/sounds/LayOnHandsCure.ogg", volume: 0.5, autoplay: true, loop: false }, true);


        }

        featUpdate.data.uses.value = featUpdate.data.uses.value - 5;
        actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
    };

}

let lay_on_hands_cure_ailment = function () {

    let confirmed = false;
    let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
    let tokenData = token;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;

    if (actorData == null || featData == null)
        ui.notifications.warn(`Selected hero must have "Lay on Hands" feat.`);
    else if (game.user.targets.size !== 1)
        ui.notifications.warn(`Please target one token.`);
    else {

        let featUpdate = duplicate(featData);
        let targetActor = game.user.targets.values().next().value.actor;

        let content = `<p><em>${actorData.name} channels holy power and attempts to cleanse ${targetActor.data.name}.</em></p>
                         <p>Which disease do you want to cleanse from ${targetActor.data.name}?</p>
                         <p>Pool of Holy Power: ${featUpdate.data.uses.value} (Min. Required: 5)</p>`;
        new Dialog({
            title: "Lay on Hands Ailment Choice",
            content: content,
            buttons: {
                poison: { label: "Cure Poison!", callback: () => confirmed = "poison" },
                disease: { label: "Cure Disease!", callback: () => confirmed = "disease" },
                cancel: { label: "Cancel", callback: () => confirmed = false }
            },
            default: "poison",

            close: html => {
                if (confirmed === "poison") {
                    lay_on_hands_cure(confirmed)
                }
                else if (confirmed === "disease") {
                    lay_on_hands_cure(confirmed)
                }
            }
        }).render(true);

    }
}

let lay_on_hands_main = function () {
    /**
 * System: D&D5e
 * Apply lay-on-hands feat to a target character.  Asks the player how many HP to heal and
 * verifies the entered value is within range before marking down usage counter. If the player
 * has OWNER permissions of target (such as GM or self-heal) the HP are applied automatically; 
 * otherwise, a 'roll' message appears allowing the target character to right-click to apply healing.
 */

    let confirmed = false;
    let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;

    if (actorData == null || featData == null)
        ui.notifications.warn(`Selected hero must have "Lay on Hands" feat.`);
    else if (game.user.targets.size !== 1)
        ui.notifications.warn(`Please target one token.`);
    else {
        let targetActor = game.user.targets.values().next().value.actor;
        let content = `<p><em>${actorData.name} channels holy power towards ${targetActor.data.name}.</em></p>
                         <p>Which action do you want to take?</p>`;
        new Dialog({
            title: "Lay on Hands",
            content: content,
            buttons: {
                heal: { label: "Heal!", callback: () => confirmed = "heal" },
                cleanse: { label: "Cleanse!", callback: () => confirmed = "cleanse" },
                cancel: { label: "Cancel", callback: () => confirmed = false }
            },
            default: "heal",

            close: html => {
                if (confirmed === "heal") {
                    lay_on_hands_heal()
                }
                else if (confirmed === "cleanse") {
                    lay_on_hands_cure_ailment()
                }
            }
        }).render(true);

    }
}


let var_anim_heal = function () {

    //This macro plays the animation on selected targets with no trajectory
    //It works for animations like Cure Wounds, Healing Ability and Dizzy Stars 
    //Import this macro, duplicate it and change its name making sure it's unique by adding the colour (i.e. "Cure Wounds Blue").
    //If it has the exact same name as the spell or item you want to trigger it from, you'll encounter an issue.
    //folder 01 is the directory path to the assets
    let folder01 = "modules/jb2a_patreon/Library/1st_Level/Cure_Wounds/";
    //anFile is the name of the file used for the animation
    let anFile = `${folder01}CureWounds_01_Blue_200x200.webm`;

    //another example would be:
    //let folder01 = "modules/jb2a_patreon/Library/Generic/Healing/"
    //let anFile = `${folder01}HealingAbility_01_Green_200x200.webm`;


    if (game.user.targets.size == 0) ui.notifications.error('You must target at least one token');
    ///Check if Module dependencies are installed or returns an error to the user
    if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");


    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    async function Cast() {
        var myStringArray = Array.from(game.user.targets)[0];
        var arrayLength = game.user.targets.size;
        for (var i = 0; i < arrayLength; i++) {

            let mainTarget = Array.from(game.user.targets)[i];
            let tarScale = ((mainTarget.data.width + mainTarget.data.height) / 2);


            let spellAnim =
            {
                file: anFile,
                position: mainTarget.center,
                anchor: {
                    x: 0.5,
                    y: 0.5
                },
                angle: 0,
                scale: {
                    x: tarScale,
                    y: tarScale
                }
            };
            canvas.fxmaster.playVideo(spellAnim);
            game.socket.emit('module.fxmaster', spellAnim);
            await wait(75);
        }
    }
    Cast()

}

let var_anim_cure_poison = function () {

    //This macro plays the animation on selected targets with no trajectory
    //It works for animations like Cure Wounds, Healing Ability and Dizzy Stars 
    //Import this macro, duplicate it and change its name making sure it's unique by adding the colour (i.e. "Cure Wounds Blue").
    //If it has the exact same name as the spell or item you want to trigger it from, you'll encounter an issue.
    //folder 01 is the directory path to the assets
    let folder01 = "modules/jb2a_patreon/Library/1st_Level/Cure_Wounds/";
    //anFile is the name of the file used for the animation
    let anFile = `${folder01}CureWounds_01_Green_200x200.webm`;

    //another example would be:
    //let folder01 = "modules/jb2a_patreon/Library/Generic/Healing/"
    //let anFile = `${folder01}HealingAbility_01_Green_200x200.webm`;


    if (game.user.targets.size == 0) ui.notifications.error('You must target at least one token');
    ///Check if Module dependencies are installed or returns an error to the user
    if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");


    const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

    async function Cast() {
        var myStringArray = Array.from(game.user.targets)[0];
        var arrayLength = game.user.targets.size;
        for (var i = 0; i < arrayLength; i++) {

            let mainTarget = Array.from(game.user.targets)[i];
            let tarScale = ((mainTarget.data.width + mainTarget.data.height) / 2);


            let spellAnim =
            {
                file: anFile,
                position: mainTarget.center,
                anchor: {
                    x: 0.5,
                    y: 0.5
                },
                angle: 0,
                scale: {
                    x: tarScale,
                    y: tarScale
                }
            };
            canvas.fxmaster.playVideo(spellAnim);
            game.socket.emit('module.fxmaster', spellAnim);
            await wait(75);
        }
    }
    Cast()

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

game.dnd5e.rollItemMacro("Lay on Hands");
lay_on_hands_main()