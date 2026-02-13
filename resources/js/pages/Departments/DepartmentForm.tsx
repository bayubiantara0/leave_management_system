import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { toast } from "react-toastify";
import { Department } from "../../types";

const DepartmentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<Department>();
    const [loading, setLoading] = useState(false);

    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            api.get(`/departments/${id}`)
                .then((response) => {
                    const data = response.data.data || response.data;
                    setValue("name", data.name);
                    setValue("code", data.code);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to load department");
                    navigate("/departments");
                });
        }
    }, [id, isEditMode, setValue, navigate]);

    const onSubmit = async (data: Department) => {
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/departments/${id}`, data);
                toast.success("Department updated successfully");
            } else {
                await api.post("/departments", data);
                toast.success("Department created successfully");
            }
            navigate("/departments");
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Failed to save department",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {isEditMode ? "Edit Department" : "Create Department"}
            </h1>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Department Name
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
                            Department Code
                        </label>
                        <input
                            type="text"
                            {...register("code", {
                                required: "Code is required",
                            })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.code.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate("/departments")}
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

export default DepartmentForm;
