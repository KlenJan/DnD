//MAKE SURE THIS MACRO IS ON YOUR GM'S HOTBAR AND IS MARKED AS 'EXECUTE AS GM' (The Furnace module)
//This is due to permissions limitations, you as a non gm player are not able to update other player's actors
//there, we will call a macro that gm has, and it will be executed with elevated privileges from their side
// MACRO NAME MUST BE loh_remove_gm     <=== This will be called in the main lay on hands macro

//args[0] = targeted token id, we will get actor in the function itself
//args[1] = condition name, in this case it will be either "Poisoned" or "Diseased"
(async function loh_remove_gm() {
    let targetActor = canvas.tokens.get(args[0]).actor;
    let ailmentType = args[1]
    let presentAilment = targetActor.effects.entries.find(entry => entry.data.label === ailmentType)
    if (typeof presentAilment === 'undefined' || (presentAilment.data.label != "Diseased" && presentAilment.data.label != "Poisoned")) {
        console.log("not found")
    }
    else {
        await targetActor.deleteEmbeddedEntity("ActiveEffect", presentAilment.id);
    }
})();