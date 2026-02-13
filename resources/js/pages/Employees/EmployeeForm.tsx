import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { toast } from "react-toastify";
import { Department, Role } from "../../types";
import { Eye, EyeOff } from "lucide-react";

interface EmployeeFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    nik: string;
    department_id: number;
    position: string;
    phone?: string;
    address?: string;
    leave_balance: number;
    date_of_joining?: string;
    role: string;
}

const EmployeeForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<EmployeeFormData>();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isEditMode = !!id;

    useEffect(() => {
        // Fetch departments
        api.get("/departments")
            .then((res) =>
                setDepartments(
                    res.data.departments || res.data.data || res.data,
                ),
            )
            .catch((err) => console.error("Failed to fetch departments", err));

        // Fetch roles
        api.get("/roles")
            .then((res) =>
                setRoles(res.data.roles || res.data.data || res.data),
            )
            .catch((err) => console.error("Failed to fetch roles", err));

        if (isEditMode) {
            api.get(`/employees/${id}`)
                .then((response) => {
                    const data = response.data.employee;
                    // User data
                    if (data.user) {
                        setValue("name", data.user.name);
                        setValue("email", data.user.email);
                        // Handle role
                        const userRole =
                            data.user.roles && data.user.roles.length > 0
                                ? data.user.roles[0].name
                                : data.user.role || "";
                        setValue("role", userRole);
                    }

                    // Employee data
                    setValue("nik", data.nik);
                    setValue("department_id", data.department_id);
                    setValue("position", data.position);
                    setValue("phone", data.phone);
                    setValue("address", data.address);
                    setValue("leave_balance", data.leave_balance);
                    setValue("date_of_joining", data.date_of_joining);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load employee");
                    navigate("/employees");
                });
        }
    }, [id, isEditMode, setValue, navigate]);

    const onSubmit = async (data: EmployeeFormData) => {
        setLoading(true);
        try {
            if (isEditMode) {
                // Remove password if empty
                if (!data.password) {
                    delete data.password;
                    delete data.password_confirmation;
                }
                await api.put(`/employees/${id}`, data);
                toast.success("Employee updated successfully");
            } else {
                await api.post("/employees", data);
                toast.success("Employee created successfully");
            }
            navigate("/employees");
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Failed to save employee",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {isEditMode ? "Edit Employee" : "Create Employee"}
            </h1>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Account Information
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required",
                                    })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password{" "}
                                    {isEditMode && "(Leave blank to keep)"}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        {...register("password", {
                                            required:
                                                !isEditMode &&
                                                "Password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Min 8 chars",
                                            },
                                        })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        {...register("password_confirmation", {
                                            required:
                                                !isEditMode &&
                                                "Confirm password",
                                            validate: (val, form) => {
                                                if (
                                                    form.password &&
                                                    val !== form.password
                                                )
                                                    return "Mismatch";
                                                return true;
                                            },
                                        })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password_confirmation.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    {...register("role", {
                                        required: "Role is required",
                                    })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Employee Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Employee Details
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    NIK
                                </label>
                                <input
                                    type="text"
                                    {...register("nik", {
                                        required: "NIK is required",
                                    })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.nik && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nik.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Department
                                </label>
                                <select
                                    {...register("department_id", {
                                        required: "Department is required",
                                    })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.department_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.department_id.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Position
                                </label>
                                <input
                                    type="text"
                                    {...register("position", {
                                        required: "Position is required",
                                    })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                {errors.position && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.position.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Leave Balance
                                </label>
                                <input
                                    type="number"
                                    {...register("leave_balance")}
                                    defaultValue={12}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Date of Joining
                                </label>
                                <input
                                    type="date"
                                    {...register("date_of_joining")}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    {...register("phone")}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <textarea
                                    {...register("address")}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate("/employees")}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? "opacity-75" : ""}`}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
