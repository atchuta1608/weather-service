"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyTemp = void 0;
function classifyTemp(tempF) {
    if (typeof tempF !== 'number' || Number.isNaN(tempF))
        return 'unknown';
    if (tempF >= 80)
        return 'hot';
    if (tempF <= 50)
        return 'cold';
    return 'moderate';
}
exports.classifyTemp = classifyTemp;
