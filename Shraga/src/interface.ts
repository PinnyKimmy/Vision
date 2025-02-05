export interface ShragaUser {
    id: string;
    adfsId: string;
    genesisId: string;
    name: { firstName: string; lastName: string };
    displayName: string;
    provider: 'Genesis' | string;
    entityType: string;
    unit: string;
    dischargeDay: string;
    rank: string;
    job: string;
    phoneNumbers: string[];
    address: string;
    photo: any;
    RelayState: string;
    exp: number;
    iat: number;
    jti: string;
}

// Add User interface and req.user field to express
declare global {
    namespace Express {
        export interface User extends ShragaUser {}
        interface Request {
            user: User;
        }
    }
}
