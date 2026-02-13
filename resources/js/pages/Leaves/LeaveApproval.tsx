import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { LeaveRequest } from "../../types";
import { toast } from "react-toastify";
import clsx from "clsx";
import { Check, X } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const LeaveApproval: React.FC = () => {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            const response = await api.get("/leaves?scope=all");
            setLeaves(
                response.data.leaves || response.data.data || response.data,
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch leave requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleApproval = async (
        id: number,
        status: "approved" | "rejected",
    ) => {
        const result = await MySwal.fire({
            title: `Are you sure?`,
            text: `You are about to ${status} this request.`,
            icon: status === "approved" ? "question" : "warning",
            showCancelButton: true,
            confirmButtonColor: status === "approved" ? "#10B981" : "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: `Yes, ${status} it!`,
        });

        if (!result.isConfirmed) return;

        try {
            await api.put(`/leaves/${id}/approval`, { status });
            MySwal.fire(
                `${status === "approved" ? "Approved" : "Rejected"}!`,
                `The request has been ${status}.`,
                "success",
            );
            fetchLeaves();
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || `Failed to ${status} request`,
            );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Leave Approvals
            </h1>

            <div className="bg-white shadow overflow-hidden rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {leave.user?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {leave.user?.department?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {leave.start_date} - {leave.end_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {leave.days_count} Days
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {leave.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={clsx(
                                                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                getStatusColor(leave.status),
                                            )}
                                        >
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {leave.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleApproval(
                                                            leave.id,
                                                            "approved",
                                                        )
                                                    }
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    <Check className="h-5 w-5 inline" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleApproval(
                                                            leave.id,
                                                            "rejected",
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <X className="h-5 w-5 inline" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No leave requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveApproval;
