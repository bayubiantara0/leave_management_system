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

export interface Employee {
    id: number;
    user_id: number;
    department_id: number | null;
    nik: string;
    position: string;
    phone: string | null;
    address: string | null;
    leave_balance: number;
    date_of_joining: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    department?: Department;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    employee?: Employee;
    department?: Department;
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
