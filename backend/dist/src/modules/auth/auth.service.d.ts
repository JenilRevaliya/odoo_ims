export declare class AuthService {
    static register(data: any): Promise<any>;
    static login(data: any): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
        accessToken: string;
        refreshToken: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map