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

async function knowledge() {

    if (!canvas.tokens.controlled[0]) {
        ui.notifications.warn(`Please make sure you are controlling your token.`);
        return
    }
    let tokenData = canvas.tokens.controlled[0]
    let actorData = game.user.character;
    let featData = actorData ? actorData.items.find(i => i.name === "Knowledge from a Past Life") : null;
    let featUpdate = duplicate(featData);
    let flavor = "Hope."
    let abilityDesc = `<div class="dnd5e chat-card item-card midi-qol-item-card" data-actor-id="Ldir6oZMHQVXWajj" data-item-id="aPRS71APm0MuyqZM">
  
<header class="card-header flexrow">
  <img src="customIcons/bundle/addons_08_b.png" title="Knowledge from a Past Life" width="36" height="36">
  <h3 class="item-name">Knowledge from a Past Life</h3>
</header>

<div class="card-content">
  <div class="rd__b  rd__b--3"><p>You temporarily remember sporadic glimpses of the past, perhaps faded memories from ages ago or a previous life. When you make an ability check that uses a skill, you can roll a <a class="inline-roll roll" title="d6" data-mode="roll" data-flavor="" data-formula="d6"><i class="fas fa-dice-d20"></i> d6</a> and add the number rolled to the check. You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest.</p><div class="rd__spc-inline-post"></div></div>
</div>

<footer class="card-footer">
  <span>None</span>
</footer>
</div>`
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `${abilityDesc}`
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

    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `${flavor}`
    }, { chatBubble: true });

    AudioHelper.play({ src: `uploads/sounds/Hou.wav`, volume: 0.4, autoplay: true, loop: false }, true);
    await new Promise(r => setTimeout(r, 1750));
    animAction(tokenData, "modules/jb2a_patreon/Library/5th_Level/Antilife_Shell/", "Antilifeshell_01_Blue_Circle_400x400.webm", 0.75, 0.75)
    AudioHelper.play({ src: `uploads/sounds/Knowledge.wav`, volume: 0.4, autoplay: true, loop: false }, true);

}

knowledge()