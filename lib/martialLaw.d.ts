import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
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
export declare const martialLawLevel: (
  table: MartialLawTable,
  playerGovernment: PlayerGovernment
) => MartialLawLevel | null;
/** The default for which units can keep martial law: any whose attack isn't 0. */
export declare const hasAttack: (unit: Unit) => boolean;
/**
 * The martial law the units in a city keep: each of the city's owner's units on its tile that `canKeepMartialLaw`,
 * in the order the unit registry has them, makes up to `perUnit` of its `unhappiness` (whole citizens) content, until it's all content
 * or `maximumUnits` have been used.
 */
export declare const martialLaw: (
  city: City,
  unhappiness: number,
  { maximumUnits, perUnit }: MartialLawLevel,
  canKeepMartialLaw?: (unit: Unit) => boolean,
  unitRegistry?: UnitRegistry
) => MartialLaw[];
