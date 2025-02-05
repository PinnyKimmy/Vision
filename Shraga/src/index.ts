import * as cookieParser from "cookie-parser";
import * as express from "express";
import { parseJWT } from "./jwt";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const shragaConfig = {
    shragaUrl: "https://shraga.shraga.branch-yesodot.org",
    callbackURL: "http://localhost:3000/auth/callback",
    secret: "secret", // Users can always see this secret so it doesn't matter what it is
    useEnrichId: false,
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auth middleware
app.use("/api", (req, res, next) => {
    console.log("Entered auth middleware");

    const token = req.cookies["access-token"];

    try {
        req.user = parseJWT(token); // parse the token into req.user
        next();
    } catch (error) {
        // We do not always want to redirect to login page, often times we want to return 403, so the client can handle it
        res.redirect(`/auth/login?relayState=${req.originalUrl}`);
    }
});

// Some route
app.get("/api/something", (req, res) => {
    console.log("Entered: GET /api/something");
    res.json({ message: "Authenticated and ready to go!", user: req.user }).end();
});

// Authentication route
app.get("/auth/login", (req, res) => {
    console.log("Entered: GET /auth/login");

    let redirectUrl =
        shragaConfig.shragaUrl +
        `/setCallback/${encodeURIComponent(shragaConfig.callbackURL)}` +
        `?SignInSecret=${encodeURIComponent(shragaConfig.secret)}` +
        `&useEnrichId=${shragaConfig.useEnrichId}` +
        `&RelayState=${req.query.relayState || "/"}`;

    res.redirect(redirectUrl);
});

// Shraga callback route
app.post("/auth/callback", (req, res) => {
    console.log("Entered: GET /auth/callback");

    const token = String(req.query.jwt);

    try {
        const payload = parseJWT(token);
        res.cookie("access-token", token);
        res.redirect(payload.RelayState || "/");
    } catch (error) {
        res.status(403).send("Unauthorized");
    }
});

app.listen(3000, () => {
    console.log(`Express listening on port 3000`);
});
