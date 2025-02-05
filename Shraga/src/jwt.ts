import * as jwt from "jsonwebtoken";
import { shragaConfig } from ".";

export const parseJWT = (token: string) => {
    const payload = jwt.verify(token, Buffer.from(shragaConfig.secret, "base64"), {
        clockTimestamp: Date.now() / 1000,
    });
    if (typeof payload !== "object") throw new Error("Invalid token");
    // You should probably check the token here to make sure it satisfies your needs
    // Sometimes when the user exists in the Active Directory but not in Kartoffel the token will be valid but we still want to reject it
    return payload as Express.User;
};
