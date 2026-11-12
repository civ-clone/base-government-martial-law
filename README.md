# base-government-martial-law

Martial law: under some governments, units in a city make its unhappy citizens content.

- `lib/martialLaw`:
  - `MartialLawTable`: `[Government, { maximumUnits, perUnit }][]`, the governments that have martial law and how
    it works under each. `martialLawLevel(table, playerGovernment)` finds the player's level, or `null`.
  - `martialLaw(city, unhappiness, level, canKeepMartialLaw?, unitRegistry?)`: a `MartialLaw` yield (from
    `base-city-yield-martial-law-content`) for each of the owner's units on the city's tile that `canKeepMartialLaw`
    (by default `hasAttack`: any unit whose attack isn't 0), each making up to `perUnit` of the `unhappiness` content,
    until it's all content or `maximumUnits` units have been used.

A library: it registers no rules, so a ruleset keeps its own rule id and priority. See `civ1-city-happiness` for
Civilization's martial law.
