import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Role } from "../../types";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";

const RoleList: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = async () => {
        try {
            const response = await api.get("/roles");
            setRoles(
                response.data.roles || response.data.data || response.data,
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                await api.delete(`/roles/${id}`);
                toast.success("Role deleted successfully");
                fetchRoles();
            } catch (error: any) {
                console.error(error);
                toast.error(
                    error.response?.data?.message || "Failed to delete role",
                );
            }
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
                <Link
                    to="/roles/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                    {roles.map((role) => (
                        <li
                            key={role.id}
                            className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center"
                        >
                            <div>
                                <p className="text-sm font-medium text-indigo-600">
                                    {role.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {role.permissions?.length || 0} Permissions
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    to={`/roles/${role.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    <Edit className="h-5 w-5" />
                                </Link>
                                {role.name !== "admin" && ( // Prevent deleting admin/user default roles via UI if desired
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                    {roles.length === 0 && (
                        <li className="px-6 py-4 text-center text-gray-500">
                            No roles found.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default RoleList;
