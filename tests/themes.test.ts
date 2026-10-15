import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accentTextColor } from '../src/themes';

test('custom accent uses white text on medium muted green', () => {
  assert.equal(accentTextColor('#809675'), '#FFFFFF');
});

test('custom accent chooses opposite text colors for dark and light backgrounds', () => {
  assert.equal(accentTextColor('#3A472E'), '#FFFFFF');
  assert.equal(accentTextColor('#FFFFFF'), '#000000');
  assert.equal(accentTextColor('#000000'), '#FFFFFF');
  assert.equal(accentTextColor('#FFDBC5'), '#000000');
});
