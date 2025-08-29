import * as assert from 'assert';
import { PreviewManager } from './previewManager';

describe('PreviewManager Test Suite', () => {
    test('PreviewManager should instantiate without errors', () => {
        assert.doesNotThrow(() => {
            new PreviewManager();
        });
    });

    test('PreviewManager should have openPreview method', () => {
        const previewManager = new PreviewManager();
        assert.strictEqual(typeof previewManager.openPreview, 'function');
    });
});