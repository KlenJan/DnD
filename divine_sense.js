game.dnd5e.rollItemMacro("Divine Sense");

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

let actorData = actor || canvas.tokens.controlled[0] || game.user.character;
ChatMessage.create({
    user: game.user._id,
    content: `${actorData.data.name} is using Divine Sense`,
    whisper: ChatMessage.getWhisperRecipients("Gamemaster"),
});

let i;
let evilPresence = false;
let goodPresence = false;

let creatureArray = [];
for (i = 0; i < canvas.tokens.placeables.length; i++) {
    let currentToken = canvas.tokens.placeables[i]
    let currentTokenType = currentToken.actor.data.data.details.type


    if (currentToken.visible === true && (currentTokenType)) {
        if ((currentTokenType.includes("undead") || currentTokenType.includes("celestial") || currentTokenType.includes("fiend"))) {

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
AudioHelper.play({ src: `uploads/sounds/Thinking${choice + 1}.ogg`, volume: 0.8, autoplay: true, loop: false }, true);

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}