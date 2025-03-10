"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fileRoute_1 = __importDefault(require("./routes/fileRoute"));
const app = (0, express_1.default)();
// Increase payload size limit to 500MB
app.use(express_1.default.json({ limit: '500mb' }));
app.use(express_1.default.urlencoded({ limit: '500mb', extended: true }));
app.use((0, cors_1.default)());
app.use('/api', fileRoute_1.default);
exports.default = app;
