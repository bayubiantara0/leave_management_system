import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { toast } from "react-toastify";
import { Permission } from "../../types";

interface RoleFormData {
    name: string;
    permissions: string[]; // Array of permission names
}

const RoleForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RoleFormData>({
        defaultValues: {
            permissions: [],
        },
    });
    const [loading, setLoading] = useState(false);
    const [permissionsList, setPermissionsList] = useState<Permission[]>([]);

    const isEditMode = !!id;

    useEffect(() => {
        // Fetch all available permissions
        api.get("/permissions")
            .then((res) =>
                setPermissionsList(
                    res.data.permissions || res.data.data || res.data,
                ),
            )
            .catch((err) => console.error("Failed to fetch permissions", err));

        if (isEditMode) {
            api.get(`/roles/${id}`)
                .then((response) => {
                    const data =
                        response.data.role ||
                        response.data.data ||
                        response.data;
                    setValue("name", data.name);
                    // Map existing permissions to array of names
                    if (data.permissions) {
                        setValue(
                            "permissions",
                            data.permissions.map((p: Permission) => p.name),
                        );
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load role");
                    navigate("/roles");
                });
        }
    }, [id, isEditMode, setValue, navigate]);

    const onSubmit = async (data: RoleFormData) => {
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/roles/${id}`, data);
                toast.success("Role updated successfully");
            } else {
                await api.post("/roles", data);
                toast.success("Role created successfully");
            }
            navigate("/roles");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {isEditMode ? "Edit Role" : "Create Role"}
            </h1>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role Name
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permissions
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-md">
                            {permissionsList.map((perm) => (
                                <div key={perm.id} className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id={`perm-${perm.id}`}
                                            type="checkbox"
                                            value={perm.name}
                                            {...register("permissions")}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor={`perm-${perm.id}`}
                                            className="font-medium text-gray-700"
                                        >
                                            {perm.name}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate("/roles")}
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

export default RoleForm;
