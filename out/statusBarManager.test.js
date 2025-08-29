"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const statusBarManager_1 = require("./statusBarManager");
describe('StatusBarManager Test Suite', () => {
    test('StatusBarManager should be a singleton', () => {
        const instance1 = statusBarManager_1.StatusBarManager.getInstance();
        const instance2 = statusBarManager_1.StatusBarManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('StatusBarManager should have default preview-first mode', () => {
        const statusBarManager = statusBarManager_1.StatusBarManager.getInstance();
        assert.strictEqual(statusBarManager.getCurrentMode(), 'preview-first');
    });
    test('StatusBarManager should toggle between modes', () => {
        const statusBarManager = statusBarManager_1.StatusBarManager.getInstance();
        const initialMode = statusBarManager.getCurrentMode();
        statusBarManager.toggleMode();
        const toggledMode = statusBarManager.getCurrentMode();
        assert.notStrictEqual(initialMode, toggledMode);
        statusBarManager.toggleMode();
        const backToInitialMode = statusBarManager.getCurrentMode();
        assert.strictEqual(initialMode, backToInitialMode);
    });
});
//# sourceMappingURL=statusBarManager.test.js.map