import * as assert from 'assert';
import { activate, deactivate } from './extension';

describe('Extension Test Suite', () => {
    test('Extension should activate without errors', () => {
        const mockContext = {
            subscriptions: []
        } as any;

        assert.doesNotThrow(() => {
            activate(mockContext);
        });
    });

    test('Extension should deactivate without errors', () => {
        assert.doesNotThrow(() => {
            deactivate();
        });
    });
});