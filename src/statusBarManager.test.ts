import * as assert from 'assert';
import { StatusBarManager } from './statusBarManager';

describe('StatusBarManager Test Suite', () => {
    test('StatusBarManager should be a singleton', () => {
        const instance1 = StatusBarManager.getInstance();
        const instance2 = StatusBarManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('StatusBarManager should have default preview-first mode', () => {
        const statusBarManager = StatusBarManager.getInstance();
        assert.strictEqual(statusBarManager.getCurrentMode(), 'preview-first');
    });

    test('StatusBarManager should toggle between modes', () => {
        const statusBarManager = StatusBarManager.getInstance();
        const initialMode = statusBarManager.getCurrentMode();
        
        statusBarManager.toggleMode();
        const toggledMode = statusBarManager.getCurrentMode();
        
        assert.notStrictEqual(initialMode, toggledMode);
        
        statusBarManager.toggleMode();
        const backToInitialMode = statusBarManager.getCurrentMode();
        
        assert.strictEqual(initialMode, backToInitialMode);
    });
});