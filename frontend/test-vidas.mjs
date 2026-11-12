import assert from 'node:assert/strict';
import { renderHeartsV2 } from './src/game/vidas.js';

assert.equal(renderHeartsV2(2, 2), '❤️❤️');
assert.equal(renderHeartsV2(1, 2), '❤️🖤');
assert.equal(renderHeartsV2(0, 2), '🖤🖤');
assert.equal(renderHeartsV2(4, 4), '❤️❤️❤️❤️');
assert.equal(renderHeartsV2(8, 6), '❤️❤️❤️❤️❤️❤️');
assert.equal(renderHeartsV2(-1, 2), '🖤🖤');

console.log('6 pruebas de visualización de vidas superadas.');
