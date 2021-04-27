# Divine sense basic

You can use this macro if you don't want your DM to fiddle with active effects or run any macros. It will detect anything within 60 yards of you if there is no collision between you and it meets the ability requirements.

Downside is, target can be set by DM as invisible due to preparation OR because target might be a ghost and it's part of what it is.

Example: Ghost in the room that is invisible and has visible parameter set as false can be detected and should be.
         Skeleton that is hiding in a closet or buried under the ground has visible parameter set as false BUT SHOULD NOT BE SENSED => he is behind total cover

Conclusion: This might enable player to see entities they should not be able to see and give them unfair advantage. It is best to consult with your DM.

# Divine sense upgraded

This is basically the same macro, the only difference is, DM can use divine_sense_add_sensable_gm.js and divine_sense_remove_sensable_gm.js to manually "brand" certain targets with an active effect. Only these invisible targets will be then able to be sensed by players using Divine sense.

Example: DM copies the macros for add/remove and puts it to their bars. They then target specific tokens and execute the macro by clicking on it. After these effects have been added, players will be able to sense these invisible targets.

Conclusion: This removes the downside of basic macro by allowing DM to target multiple tokens and (un)make them sensable at once click.

Final note: You don't have to add 'Sensable' condition using the macros provided, you can also create it using CUB or by any other means. Just make sure the label of given condition contains 'Sensable' or refactor it yourself in the code.