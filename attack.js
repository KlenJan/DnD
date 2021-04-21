function attack(choiceVar) {
    AudioHelper.play({ src: "uploads/sounds/HolyAttack.ogg", volume: 0.8, autoplay: true, loop: false }, true);
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function attacksound(choiceVar) {

    let fileType = ".ogg"
    if(choiceVar > 1)
    {
          fileType = ".wav"
    }
    AudioHelper.play({ src: `uploads/sounds/Attack${choiceVar + 1}${fileType}`, volume: 0.8, autoplay: true, loop: false }, true);
    
    let textArray = [
        "For justice!",
        `Justice demands retribution!`,
        "Fall by my hand!.",
        "You must obey!",
        
    ]

    ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: `${textArray[choiceVar]}`
    }, { chatBubble: true });


}

var choice = getRandomInt(4)
game.dnd5e.rollItemMacro("Flail");
attacksound(choice)
await new Promise(r => setTimeout(r, 2000));
attack(choice)