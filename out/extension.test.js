"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const extension_1 = require("./extension");
describe('Extension Test Suite', () => {
    test('Extension should activate without errors', () => {
        const mockContext = {
            subscriptions: []
        };
        assert.doesNotThrow(() => {
            (0, extension_1.activate)(mockContext);
        });
    });
    test('Extension should deactivate without errors', () => {
        assert.doesNotThrow(() => {
            (0, extension_1.deactivate)();
        });
    });
});
//# sourceMappingURL=extension.test.js.map