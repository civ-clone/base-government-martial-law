"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.martialLaw = exports.hasAttack = exports.martialLawLevel = void 0;
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const MartialLaw_1 = require("@civ-clone/base-city-yield-martial-law-content/MartialLaw");
/** The level of martial law under the player's government, or `null` if it has none. */
const martialLawLevel = (table, playerGovernment) => {
    var _a, _b;
    return (_b = (_a = table.find(([GovernmentType]) => playerGovernment.is(GovernmentType))) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
};
exports.martialLawLevel = martialLawLevel;
/** The default for which units can keep martial law: any whose attack isn't 0. */
const hasAttack = (unit) => unit.attack().value() > 0;
exports.hasAttack = hasAttack;
/**
 * The martial law the units in a city keep: each of the city's owner's units on its tile that `canKeepMartialLaw`,
 * in the order the unit registry has them, makes up to `perUnit` of its `unhappiness` (whole citizens) content, until it's all content
 * or `maximumUnits` have been used.
 */
const martialLaw = (city, unhappiness, { maximumUnits, perUnit }, canKeepMartialLaw = exports.hasAttack, unitRegistry = UnitRegistry_1.instance) => {
    // Only whole citizens can be made content.
    const citizens = Math.trunc(unhappiness);
    return unitRegistry
        .getByTile(city.tile())
        .filter((unit) => unit.player() === city.player() && canKeepMartialLaw(unit))
        .slice(0, Math.min(maximumUnits, Math.ceil(citizens / perUnit)))
        .map((unit, index) => new MartialLaw_1.default(Math.min(perUnit, citizens - index * perUnit), unit));
};
exports.martialLaw = martialLaw;
//# sourceMappingURL=martialLaw.js.map