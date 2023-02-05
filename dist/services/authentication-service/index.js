"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const session_repository_1 = __importDefault(require("../../repositories/session-repository/index"));
const user_repository_1 = __importDefault(require("../../repositories/user-repository/index"));
const prisma_utils_1 = require("../../utils/prisma-utils");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("./errors");
async function signIn(params) {
    const { email, password } = params;
    const user = await getUserOrFail(email);
    await validatePasswordOrFail(password, user.password);
    const token = await createSession(user.id);
    return {
        user: prisma_utils_1.exclude(user, "password"),
        token,
    };
}
async function signInOAuth(email) {
    const user = await getUserOrFailOAuth(email);
    const userToken = await createSession(user.id);
    return {
        user: {
            email: user.email,
            id: user.id
        },
        token: userToken,
    };
}
async function getUserOrFailOAuth(email) {
    let user = await user_repository_1.default.findByEmail(email, { id: true, email: true, password: true });
    if (!user) { //If user is not registered yet, creates a new user with a random password, user should be able to login with github nonetheless
        user = await user_repository_1.default.create({ email: email, password: createRandomPassword() });
    }
    return user;
}
function createRandomPassword() {
    let password = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < 64; i++) {
        password += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return password;
}
async function getUserOrFail(email) {
    const user = await user_repository_1.default.findByEmail(email, { id: true, email: true, password: true });
    if (!user)
        throw errors_1.invalidCredentialsError();
    return user;
}
async function createSession(userId) {
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET);
    await session_repository_1.default.create({
        token,
        userId,
    });
    return token;
}
async function validatePasswordOrFail(password, userPassword) {
    const isPasswordValid = await bcrypt_1.default.compare(password, userPassword);
    if (!isPasswordValid)
        throw errors_1.invalidCredentialsError();
}
const authenticationService = {
    signIn,
    signInOAuth
};
exports.default = authenticationService;
__exportStar(require("./errors"), exports);
