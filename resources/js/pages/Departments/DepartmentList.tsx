import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Department } from "../../types";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";

const DepartmentList: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");
            setDepartments(
                response.data.departments ||
                    response.data.data ||
                    response.data,
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleDelete = async (id: number) => {
        if (
            window.confirm("Are you sure you want to delete this department?")
        ) {
            try {
                await api.delete(`/departments/${id}`);
                toast.success("Department deleted successfully");
                fetchDepartments();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete department");
            }
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Departments
                </h1>
                <Link
                    to="/departments/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                    {departments.map((dept) => (
                        <li
                            key={dept.id}
                            className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center"
                        >
                            <div>
                                <p className="text-sm font-medium text-indigo-600">
                                    {dept.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Code: {dept.code}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    to={`/departments/${dept.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    <Edit className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(dept.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                    {departments.length === 0 && (
                        <li className="px-6 py-4 text-center text-gray-500">
                            No departments found.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default DepartmentList;
