export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: 'admin' | 'editor' | 'writer' | 'reader';
    email_verified_at: string | null;
    can_access_newsroom: boolean;
    can_manage_newsroom: boolean;
    is_admin: boolean;
    is_chat_blocked: boolean;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
