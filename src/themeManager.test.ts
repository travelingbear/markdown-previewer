import * as assert from 'assert';
import { ThemeManager } from './themeManager';

describe('ThemeManager Test Suite', () => {
    test('ThemeManager should be a singleton', () => {
        const instance1 = ThemeManager.getInstance();
        const instance2 = ThemeManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('ThemeManager should have getCurrentTheme method', () => {
        const themeManager = ThemeManager.getInstance();
        const theme = themeManager.getCurrentTheme();
        assert.ok(theme === 'light' || theme === 'dark');
    });

    test('ThemeManager should provide CSS for both themes', () => {
        const themeManager = ThemeManager.getInstance();
        const lightCSS = themeManager.getLightThemeCSS();
        const darkCSS = themeManager.getDarkThemeCSS();
        
        assert.ok(lightCSS.includes('background-color: #ffffff'));
        assert.ok(darkCSS.includes('background-color: #0d1117'));
    });
});