"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const previewManager_1 = require("./previewManager");
describe('PreviewManager Test Suite', () => {
    test('PreviewManager should instantiate without errors', () => {
        assert.doesNotThrow(() => {
            new previewManager_1.PreviewManager();
        });
    });
    test('PreviewManager should have openPreview method', () => {
        const previewManager = new previewManager_1.PreviewManager();
        assert.strictEqual(typeof previewManager.openPreview, 'function');
    });
});
//# sourceMappingURL=previewManager.test.js.map