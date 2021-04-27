(async function set_sensable(){
    const data = [{label: "Sensable"}];
    game.user.targets.forEach(element => element.actor.createEmbeddedEntity("ActiveEffect", data))
})();