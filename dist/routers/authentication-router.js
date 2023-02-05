"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationRouter = void 0;
const controllers_1 = require("../controllers/index");
const middlewares_1 = require("../middlewares/index");
const schemas_1 = require("../schemas/index");
const express_1 = require("express");
const authenticationRouter = express_1.Router();
exports.authenticationRouter = authenticationRouter;
authenticationRouter.post("/sign-in", middlewares_1.validateBody(schemas_1.signInSchema), controllers_1.singInPost);
authenticationRouter.post("/github-login", controllers_1.exChangeCodeForAcessToken);
