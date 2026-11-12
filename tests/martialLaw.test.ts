import {
  MartialLawTable,
  hasAttack,
  martialLaw,
  martialLawLevel,
} from '../lib/martialLaw';
import City from '@civ-clone/core-city/City';
import Government from '@civ-clone/core-government/Government';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { expect } from 'chai';

class Strict extends Government {}
class Stricter extends Government {}
class Lenient extends Government {}

const table: MartialLawTable = [
    [Strict, { maximumUnits: 3, perUnit: 1 }],
    [Stricter, { maximumUnits: 3, perUnit: 2 }],
  ],
  playerGovernment = (government: Government): PlayerGovernment =>
    ({
      is: (...GovernmentTypes: (typeof Government)[]) =>
        GovernmentTypes.some(
          (GovernmentType) => government instanceof GovernmentType
        ),
    } as unknown as PlayerGovernment),
  // Stand-ins: a city, and units on its tile with the given attack (owned by the city's player unless `foreign`).
  setUp = (...units: [attack: number, foreign?: boolean][]) => {
    const player = {},
      tile = {},
      city = { player: () => player, tile: () => tile } as unknown as City,
      unitsOnTile = units.map(
        ([attack, foreign = false], index): Unit =>
          ({
            id: () => `unit-${index}`,
            player: () => (foreign ? {} : player),
            attack: () => ({ value: () => attack }),
          } as unknown as Unit)
      ),
      unitRegistry = {
        getByTile: (tileToFind: unknown) =>
          tileToFind === tile ? unitsOnTile : [],
      } as unknown as UnitRegistry;

    return { city, unitsOnTile, unitRegistry };
  };

describe('martialLaw', (): void => {
  // `MartialLaw` is a negative `Unhappiness`, so its value counts down the city's unhappiness.
  it('finds the level for the player’s government, or none', (): void => {
    expect(martialLawLevel(table, playerGovernment(new Strict()))).eql({
      maximumUnits: 3,
      perUnit: 1,
    });
    expect(martialLawLevel(table, playerGovernment(new Stricter()))).eql({
      maximumUnits: 3,
      perUnit: 2,
    });
    expect(martialLawLevel(table, playerGovernment(new Lenient()))).null;
  });

  it('uses one unit per unhappy citizen, up to the maximum, in order', (): void => {
    const { city, unitsOnTile, unitRegistry } = setUp([1], [1], [1], [1]),
      yields = martialLaw(city, 5, table[0][1], hasAttack, unitRegistry);

    expect(yields.map((cityYield) => cityYield.value())).eql([-1, -1, -1]);
    expect(yields.map((cityYield) => cityYield.unit())).eql(
      unitsOnTile.slice(0, 3)
    );
    expect(
      martialLaw(city, 2, table[0][1], hasAttack, unitRegistry).length
    ).equal(2);
    expect(martialLaw(city, 0, table[0][1], hasAttack, unitRegistry)).eql([]);
    // Only whole citizens count.
    expect(
      martialLaw(city, 2.5, table[0][1], hasAttack, unitRegistry).length
    ).equal(2);
  });

  it('skips units that cannot keep it and units of other players', (): void => {
    const { city, unitsOnTile, unitRegistry } = setUp([0], [1, true], [2]),
      yields = martialLaw(city, 3, table[0][1], hasAttack, unitRegistry);

    expect(yields.map((cityYield) => cityYield.unit())).eql([unitsOnTile[2]]);
    expect(
      martialLaw(city, 3, table[0][1], () => true, unitRegistry).map(
        (cityYield) => cityYield.unit()
      )
    ).eql([unitsOnTile[0], unitsOnTile[2]]);
  });

  it('makes up to perUnit citizens content with each unit, and no more than are unhappy', (): void => {
    const { city, unitRegistry } = setUp([1], [1], [1], [1]);

    expect(
      martialLaw(city, 5, table[1][1], hasAttack, unitRegistry).map(
        (cityYield) => cityYield.value()
      )
    ).eql([-2, -2, -1]);
    expect(
      martialLaw(city, 9, table[1][1], hasAttack, unitRegistry).map(
        (cityYield) => cityYield.value()
      )
    ).eql([-2, -2, -2]);
  });
});
