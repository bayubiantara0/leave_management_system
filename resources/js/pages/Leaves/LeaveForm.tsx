import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

interface LeaveFormData {
    start_date: string;
    end_date: string;
    reason: string;
}

const LeaveForm: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LeaveFormData>();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const startDate = watch("start_date");
    const endDate = watch("end_date");

    // Simple day calculation (inclusive)
    const calculateDays = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays > 0 ? diffDays : 0;
        }
        return 0;
    };

    const daysCount = calculateDays();

    const onSubmit = async (data: LeaveFormData) => {
        setLoading(true);
        try {
            await api.post("/leaves", data);
            toast.success("Leave request submitted successfully");
            navigate("/leaves");
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to submit leave request",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Apply for Leave
            </h1>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                    Your Leave Balance:{" "}
                    <span className="font-bold">
                        {user?.leave_balance ?? 12} Days
                    </span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <input
                                type="date"
                                {...register("start_date", {
                                    required: "Start date is required",
                                })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.start_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.start_date.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <input
                                type="date"
                                {...register("end_date", {
                                    required: "End date is required",
                                })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.end_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.end_date.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Duration
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={`${daysCount} Days`}
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-600"
                        />
                        {user?.leave_balance !== undefined &&
                            daysCount > user.leave_balance && (
                                <p className="mt-1 text-sm text-red-600">
                                    Warning: Insufficient leave balance!
                                </p>
                            )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Reason
                        </label>
                        <textarea
                            {...register("reason", {
                                required: "Reason is required",
                            })}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.reason && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.reason.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate("/leaves")}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? "opacity-75" : ""}`}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveForm;
