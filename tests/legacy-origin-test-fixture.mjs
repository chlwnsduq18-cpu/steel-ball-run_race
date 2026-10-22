import {createRace} from '../dist/src/race.js';
// Explicit v0.43 content fixture: these suites exercise retained three-chapter
// stories and their preexisting scheduler. Fresh v0.44 runs are tested separately
// in hidden-routes-tests.mjs through the real event and combat APIs.
export function createLegacyOriginRace(D,R,options){
 return createRace({...D,hiddenRoutes:{}},R,options);
}
