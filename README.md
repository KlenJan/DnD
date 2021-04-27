# Foundry VTT D&D 5e
Paladin dnd macros with some animations and sound effects 

replace sounds files with your own or just comment out the lines that use them as well as animations

List of abilities:
 - Lay On Hands (UPDATE: refactored the code, now you can remove conditions using with the help of your GM, see lay on hands folder README.md)
 - Divine Sense
 - Knowledge From Past Life (Reborn trait)
 - generic attack scripts (UPDATE: animations are now synced with sounds, reworked the whole logic using hooks)

Backlog:
 - some of 1st spell slot level spells

TODO soon:
 - DONE ~~Lay on Hands => add support for Active Effects (Poison, Disease) removal using callback macros executed as DM, remove extra input window~~
 - DONE ~~Divine Sense => add flexibility for all vision ranges and check for collision if not within sight but still within 60ft~~
 - DONE ~~Knowledge From Past Life - Add automatic roll~~
 - Divine Smite

# How to create and edit macros

You can drag whatever ability to your action bar and then right click it to edit, for some actions you require macros to be executed as DM. For example removing of conditions such as poison or disease. See crymic's repository listed in resources, namely callback macros and README.md file. It is explained what DM has to do and how it works.

# Examples:

- generic attack https://streamable.com/jfbezy

- lay on hands https://streamable.com/km8qy8

- divine sense https://streamable.com/gaodly

- knowledge from past life https://streamable.com/k9w8me

# Resources used

- https://github.com/foundry-vtt-community/macros
- https://gitlab.com/crymic/foundry-vtt-macros/-/tree/master/  - make sure to check these out if you are interested in other classes
- https://foundryvtt.com/api/

Modules:
- fxmaster,
- jb2e,
- tokenmagicfx,
- automated animation,
- midiqol,
- dae,
- the furnace,
- combat utility belt (cub)
