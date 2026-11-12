import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Government from '@civ-clone/core-government/Government';
import MartialLaw from '@civ-clone/base-city-yield-martial-law-content/MartialLaw';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Unit from '@civ-clone/core-unit/Unit';

/** How martial law works under a government: how many units can keep it, and how many citizens each makes content. */
export type MartialLawLevel = {
  maximumUnits: number;
  perUnit: number;
};

/** The governments that have martial law, each with its level. The first that matches the player's government wins. */
export type MartialLawTable = [typeof Government, MartialLawLevel][];

/** The level of martial law under the player's government, or `null` if it has none. */
export const martialLawLevel = (
  table: MartialLawTable,
  playerGovernment: PlayerGovernment
): MartialLawLevel | null =>
  table.find(([GovernmentType]) => playerGovernment.is(GovernmentType))?.[1] ??
  null;

/** The default for which units can keep martial law: any whose attack isn't 0. */
export const hasAttack = (unit: Unit): boolean => unit.attack().value() > 0;

/**
 * The martial law the units in a city keep: each of the city's owner's units on its tile that `canKeepMartialLaw`,
 * in the order the unit registry has them, makes up to `perUnit` of its `unhappiness` (whole citizens) content, until it's all content
 * or `maximumUnits` have been used.
 */
export const martialLaw = (
  city: City,
  unhappiness: number,
  { maximumUnits, perUnit }: MartialLawLevel,
  canKeepMartialLaw: (unit: Unit) => boolean = hasAttack,
  unitRegistry: UnitRegistry = unitRegistryInstance
): MartialLaw[] => {
  // Only whole citizens can be made content.
  const citizens = Math.trunc(unhappiness);

  return unitRegistry
    .getByTile(city.tile())
    .filter(
      (unit: Unit): boolean =>
        unit.player() === city.player() && canKeepMartialLaw(unit)
    )
    .slice(0, Math.min(maximumUnits, Math.ceil(citizens / perUnit)))
    .map(
      (unit: Unit, index: number): MartialLaw =>
        new MartialLaw(Math.min(perUnit, citizens - index * perUnit), unit)
    );
};
