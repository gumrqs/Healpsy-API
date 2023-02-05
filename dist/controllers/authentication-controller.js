"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exChangeCodeForAcessToken = exports.singInPost = void 0;
const authentication_service_1 = __importDefault(require("../services/authentication-service/index"));
const axios_1 = __importDefault(require("axios"));
const http_status_1 = __importDefault(require("http-status"));
async function singInPost(req, res) {
    const { email, password } = req.body;
    try {
        const result = await authentication_service_1.default.signIn({ email, password });
        return res.status(http_status_1.default.OK).send(result);
    }
    catch (error) {
        return res.status(http_status_1.default.UNAUTHORIZED).send(error.message);
    }
}
exports.singInPost = singInPost;
async function exChangeCodeForAcessToken(req, res) {
    const { code } = req.body;
    const { REDIRECT_URL, CLIENT_ID, CLIENT_SECRET } = process.env;
    const GITHUB_ACESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
    const body = {
        code,
        grant_type: "authorization_URL",
        redirect_uri: REDIRECT_URL,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    };
    try {
        const response = await axios_1.default.post(GITHUB_ACESS_TOKEN_URL, body, {
            headers: {
                "Accept": "application/json"
            }
        });
        const token = response.data.access_token;
        const userResponse = await axios_1.default.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const userIdentification = userResponse.data.email ? userResponse.data.email : userResponse.data.id + "";
        const user = await authentication_service_1.default.signInOAuth(userIdentification);
        return res.status(http_status_1.default.OK).send(user);
    }
    catch (error) {
        return res.status(http_status_1.default.UNAUTHORIZED).send({});
    }
}
exports.exChangeCodeForAcessToken = exChangeCodeForAcessToken;
