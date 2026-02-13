import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { toast } from "react-toastify";
import { User, Department, Role } from "../../types";
import { Eye, EyeOff } from "lucide-react";

interface UserFormData extends User {
    password?: string;
    password_confirmation?: string;
    department_id: number;
    role: string;
}

const UserForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<UserFormData>();
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
            api.get(`/users/${id}`)
                .then((response) => {
                    const data =
                        response.data.user ||
                        response.data.data ||
                        response.data;
                    setValue("name", data.name);
                    setValue("email", data.email);
                    setValue("nik", data.nik);
                    setValue("department_id", data.department_id);
                    setValue("leave_balance", data.leave_balance);

                    // Handle role: API returns roles array, form expects single string name if simple assignment
                    const userRole =
                        data.roles && data.roles.length > 0
                            ? data.roles[0].name
                            : data.role || "";
                    setValue("role", userRole);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load user");
                    navigate("/users");
                });
        }
    }, [id, isEditMode, setValue, navigate]);

    const onSubmit = async (data: UserFormData) => {
        setLoading(true);
        try {
            if (isEditMode) {
                // Remove password if empty
                if (!data.password) {
                    delete data.password;
                    delete data.password_confirmation;
                }
                await api.put(`/users/${id}`, data);
                toast.success("User updated successfully");
            } else {
                await api.post("/users", data);
                toast.success("User created successfully");
            }
            navigate("/users");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {isEditMode ? "Edit User" : "Create User"}
            </h1>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            {...register("name", {
                                required: "Name is required",
                            })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            {isEditMode && "(Leave blank to keep current)"}
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required:
                                        !isEditMode && "Password is required",
                                    minLength: {
                                        value: 8,
                                        message:
                                            "Password must be at least 8 characters",
                                    },
                                })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Eye
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
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
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("password_confirmation", {
                                    required:
                                        !isEditMode &&
                                        "Please confirm your password",
                                    validate: (value, formValues) => {
                                        if (
                                            formValues.password &&
                                            value !== formValues.password
                                        ) {
                                            return "Passwords do not match";
                                        }
                                        return true;
                                    },
                                })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Eye
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
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
                            NIK (Nomor Induk Karyawan)
                        </label>
                        <input
                            type="text"
                            {...register("nik")}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Department
                        </label>
                        <select
                            {...register("department_id")}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Leave Balance
                        </label>
                        <input
                            type="number"
                            {...register("leave_balance")}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            defaultValue={12}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            {...register("role", {
                                required: "Role is required",
                            })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate("/users")}
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

export default UserForm;
