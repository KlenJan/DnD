function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let anim_loh = function (animColor) {
    //This macro plays the animation on selected targets with no trajectory
    //It works for animations like Cure Wounds, Healing Ability and Dizzy Stars 
    //Import this macro, duplicate it and change its name making sure it's unique by adding the colour (i.e. "Cure Wounds Blue").
    //If it has the exact same name as the spell or item you want to trigger it from, you'll encounter an issue.
    //folder 01 is the directory path to the assets
    let folder01 = "modules/jb2a_patreon/Library/Generic/Healing/";
    //anFile is the name of the file used for the animation
    let anFile = `${folder01}HealingAbility_01_${animColor}_200x200.webm`;
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

async function heal_anim_sound_play(choice) {
    AudioHelper.play({ src: `uploads/sounds/HolyLight${choice + 1}.wav`, volume: 0.4, autoplay: true, loop: false }, true);
    await new Promise(r => setTimeout(r, 1750));
    AudioHelper.play({ src: `uploads/sounds/LayOnHands.ogg`, volume: 0.4, autoplay: true, loop: false }, true);
    anim_loh("Yellow")
}

async function cure_anim_sound_play() {
    AudioHelper.play({ src: `uploads/sounds/Purity.wav`, volume: 0.4, autoplay: true, loop: false }, true);
    await new Promise(r => setTimeout(r, 1000));
    AudioHelper.play({ src: `uploads/sounds/LayOnHandsCure.ogg`, volume: 0.4, autoplay: true, loop: false }, true);
    anim_loh("Green")
}

async function lay_on_hands_heal_window(realActorName) {
    let confirmed = false;
    let tokenData = canvas.tokens.controlled[0]
    let actorData = actor || canvas.tokens.controlled[0].actor || game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;
    let featUpdate = duplicate(featData);
    let targetToken = game.user.targets.values().next().value;
    let targetActor = targetToken.actor;
    let maxHeal = Math.clamped(featUpdate.data.uses.value, 0,
        targetActor.data.data.attributes.hp.max - targetActor.data.data.attributes.hp.value);
    let content = `<p><em>${actorData.name} lays hands on ${realActorName}.</em></p>
                             <p>How many HP do you want to restore to ${realActorName}?</p>
                             <p>Pool of Holy Power: ${featUpdate.data.uses.value}</p>
                             <form>
                                 <div class="form-group">
                                     <label for="num">HP to Restore: (Max = ${maxHeal})</label>
                                     <input id="num" name="num" type="number" min="0" max="${maxHeal}"></input>
                                 </div>
                             </form>`;
    if (game.user.targets.size !== 1) {
        ui.notifications.warn(`Please target one token.`);
        return
    }

    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `<div class="dnd5e chat-card item-card midi-qol-item-card" data-actor-id="Ldir6oZMHQVXWajj" data-item-id="ck5BrbhhuvJTXhas">
        <header class="card-header flexrow">
          <img src="systems/dnd5e/icons/skills/light_10.jpg" title="Lay on Hands" width="36" height="36">
          <h3 class="item-name">Lay on Hands</h3>
        </header>
        <div class="card-content">
          <div class="rd__b  rd__b--3"><p>Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5.</p><div class="rd__spc-inline-post"></div><p>As an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool.</p><p>Alternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize one poison affecting it. You can cure multiple diseases and neutralize multiple poisons with a single use of Lay on Hands, expending hit points separately for each one.</p><p>This feature has no effect on undead and constructs.</p></div>
        </div>  
        <footer class="card-footer">
          <span>Paladin 1</span>
          <span>1 Action (Target cannot be Undead or a Construct.)</span>
          <span>1 Creature</span>
          <span>Touch</span>
        </footer>
      </div>`
    });

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
                    AudioHelper.play({ src: `uploads/sounds/Error1.ogg`, volume: 0.4, autoplay: true, loop: false }, true);
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
                    let damageRoll = new Roll(`${number}`).roll();

                    new MidiQOL.DamageOnlyWorkflow(actorData, tokenData, damageRoll.total, "healing", [targetToken], damageRoll, { flavor: `(Healing)`, itemCardId: tokenData.itemCardId });
                    featUpdate.data.uses.value = featUpdate.data.uses.value - number;
                    actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker(),
                        content: `${flavor}`
                    }, { chatBubble: true });

                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker(),
                        content: `${actorData.name} lays hands on ${realActorName} for ${number} HP.`
                    });
                    heal_anim_sound_play(soundChoiceDefault)

                }
            }
        }
    }).render(true);
}

async function lay_on_hands_cure(ailmentType, realActorName) {

    let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;
    let featUpdate = duplicate(featData);
    let targetToken = game.user.targets.values().next().value;
    let targetActor = targetToken.actor
    let conditions = {
        "poison": "Poisoned",
        "disease": "Diseased"
    }
    let presentAilment = targetActor.effects.entries.find(entry => entry.data.label === conditions[ailmentType])
    if (game.user.targets.size !== 1) {
        ui.notifications.warn(`Please target one token.`);
        return
    }

    if (featUpdate.data.uses.value < 5 || (targetActor.data.data.details.race === "Undead" || targetActor.data.data.details.race === "Construct") || (targetActor.data.data.details.type === "undead" || targetActor.data.data.details.type === "construct") || typeof presentAilment === 'undefined') {
        AudioHelper.play({ src: `uploads/sounds/Error1.ogg`, volume: 0.4, autoplay: true, loop: false }, true);
        let textArray = [
            `Light does not answer my calls. I can't cure ${ailmentType} from you, ${realActorName}.`,
            "Light does not answer my calls. I am unable to cure myself.",
            "I am unable to cure such a foul creature!",
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
            `Let the light cleanse you, ${realActorName}.`
        ]
        let choice = getRandomInt(3);
        let flavor = `<strong>${textArray[choice]}</strong><br>`
        let loh_remove = game.macros.getName("loh_remove_gm")

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${flavor}`
        }, { chatBubble: true });
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker(),
            content: `${actorData.name} lays hands on ${realActorName} and cleanses <em>${ailmentType}</em>.`
        });
        cure_anim_sound_play()
        loh_remove.execute(targetToken.id, conditions[ailmentType])
        featUpdate.data.uses.value = featUpdate.data.uses.value - 5;
        actorData.updateEmbeddedEntity("OwnedItem", featUpdate);
    }  
}

async function lay_on_hands_cure_ailment_window(realActorName) {

    let confirmed = false;
    let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Lay on Hands") : null;

    if (actorData == null || featData == null)
        ui.notifications.warn(`Selected hero must have "Lay on Hands" feat.`);
    else if (game.user.targets.size !== 1)
        ui.notifications.warn(`Please target one token.`);
    else {

        let featUpdate = duplicate(featData);
        let targetActor = game.user.targets.values().next().value.actor;

        let content = `<p><em>${actorData.name} channels holy power and attempts to cleanse ${realActorName}.</em></p>
                         <p>Which disease do you want to cleanse from ${realActorName}?</p>
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
                    lay_on_hands_cure(confirmed, realActorName)
                }
                else if (confirmed === "disease") {
                    lay_on_hands_cure(confirmed, realActorName)
                }
            }
        }).render(true);

    }
}

async function lay_on_hands_main_window() {
    /**
 * System: D&D5e
 * Apply lay-on-hands feat to a target character.  Asks the player how many HP to heal and
 * verifies the entered value is within range before marking down usage counter. 
 * You can also cleanse poison/disease from a target if your gm has elevated macro => IMPORTANT
 * SEE README.md file in lay on hands folder
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
        let creatureStart = targetActor.data.name.indexOf("(")
        let creatureEnd = targetActor.data.name.indexOf(")")
        let realActorName = targetActor.data.name
        if (creatureStart >= 0 && creatureEnd >= 0 && creatureEnd > creatureStart) {
            realActorName = targetActor.data.name.substring(creatureStart + 1, creatureEnd)
        }

        let content = `<p><em>${actorData.name} channels holy power towards ${realActorName}.</em></p>
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
                    lay_on_hands_heal_window(realActorName)
                }
                else if (confirmed === "cleanse") {
                    lay_on_hands_cure_ailment_window(realActorName)
                }
            }
        }).render(true);

    }
}
lay_on_hands_main_window()