(async function remove_sensable() {
    game.user.targets.forEach(element => query_data(element))
})();

async function query_data(element) {
    let data = element.actor.effects.filter(i => i.data.label == "Sensable");
    let deletions = data.map(i => i.data._id);
    await element.actor.deleteEmbeddedEntity("ActiveEffect", deletions);
}