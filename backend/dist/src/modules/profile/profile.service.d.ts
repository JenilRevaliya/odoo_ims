export declare class ProfileService {
    static getProfile(userId: string): Promise<any>;
    static updateProfile(userId: string, data: {
        name?: string;
        email?: string;
        current_password?: string;
        new_password?: string;
    }): Promise<any>;
}
//# sourceMappingURL=profile.service.d.ts.map