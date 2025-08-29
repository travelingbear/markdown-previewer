"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const themeManager_1 = require("./themeManager");
describe('ThemeManager Test Suite', () => {
    test('ThemeManager should be a singleton', () => {
        const instance1 = themeManager_1.ThemeManager.getInstance();
        const instance2 = themeManager_1.ThemeManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('ThemeManager should have getCurrentTheme method', () => {
        const themeManager = themeManager_1.ThemeManager.getInstance();
        const theme = themeManager.getCurrentTheme();
        assert.ok(theme === 'light' || theme === 'dark');
    });
    test('ThemeManager should provide CSS for both themes', () => {
        const themeManager = themeManager_1.ThemeManager.getInstance();
        const lightCSS = themeManager.getLightThemeCSS();
        const darkCSS = themeManager.getDarkThemeCSS();
        assert.ok(lightCSS.includes('background-color: #ffffff'));
        assert.ok(darkCSS.includes('background-color: #0d1117'));
    });
});
//# sourceMappingURL=themeManager.test.js.map