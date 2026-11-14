import test from 'node:test';
import assert from 'node:assert/strict';
import { calTokens } from '../lib/design-tokens.ts';

test('design tokens adhere strictly to Cal.com DESIGN.md anti-slop spec', () => {
  assert.strictEqual(calTokens.colors.ink, '#111111', 'Primary text/ink must be #111111');
  assert.strictEqual(calTokens.colors.canvas, '#ffffff', 'Background canvas must be #ffffff');
  assert.strictEqual(calTokens.colors.surfaceSubtle, '#f8f9fa', 'Surface subtle must be #f8f9fa');
  assert.strictEqual(calTokens.colors.hairline, '#e5e7eb', 'Border hairline must be #e5e7eb');
  assert.strictEqual(calTokens.radii.md, '8px', 'Border radius md must be 8px');
  assert.strictEqual(calTokens.radii.lg, '12px', 'Border radius lg must be 12px');
});
