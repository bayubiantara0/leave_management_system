export interface Department {
    id: number;
    name: string;
    code: string;
    created_at?: string;
    updated_at?: string;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Permission[];
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string; // or roles[] depending on implementation
    roles?: Role[];
    permissions: string[];
    department_id?: number;
    department?: Department;
    leave_balance?: number;
    nik?: string;
    created_at?: string;
    updated_at?: string;
}

export interface LeaveRequest {
    id: number;
    user_id: number;
    user?: User;
    start_date: string;
    end_date: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    days_count: number;
    admin_remarks?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginResponse {
    user: User;
    token: string;
}
