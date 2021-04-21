game.dnd5e.rollItemMacro("Knowledge from a Past Life");

let flavor = "Hope."

ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content: `${flavor}`
}, { chatBubble: true });

AudioHelper.play({ src: `uploads/sounds/Hou.wav`, volume: 0.8, autoplay: true, loop: false }, true);