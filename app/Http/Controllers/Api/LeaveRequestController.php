<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaveRequestController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view_own_leaves|view_all_leaves')->only(['index', 'show']);
        $this->middleware('permission:create_leaves')->only(['store']);
        $this->middleware('permission:approve_leaves')->only(['approve']);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->can('view_all_leaves')) {
            $query = LeaveRequest::with('user');
            
            if ($request->has('department')) {
                $query->whereHas('user', function($q) use ($request) {
                    $q->where('department', $request->department);
                });
            }
            
            return response()->json(['leaves' => $query->latest()->get()]);
        }

        return response()->json([
            'leaves' => $user->leaveRequests()->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $daysCount = $startDate->diffInDays($endDate) + 1;

        $user = $request->user();
        
        // Ensure employee record exists
        if (!$user->employee) {
             return response()->json(['message' => 'Employee data not found.'], 404);
        }

        if ($user->employee->leave_balance < $daysCount) {
            return response()->json([
                'message' => 'Insufficient leave balance.',
                'current_balance' => $user->employee->leave_balance,
                'requested_days' => $daysCount
            ], 422);
        }

        $leavePromise = $user->leaveRequests()->create([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $request->reason,
            'status' => 'pending',
            'days_count' => $daysCount,
        ]);

        return response()->json([
            'message' => 'Leave request submitted successfully',
            'leave' => $leavePromise
        ], 201);
    }

    public function show($id)
    {
        $leave = LeaveRequest::with('user')->findOrFail($id);
        $user = request()->user();

        if ($leave->user_id !== $user->id && !$user->can('view_all_leaves')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['leave' => $leave]);
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_remarks' => 'nullable|string',
        ]);

        $leave = LeaveRequest::with('user')->findOrFail($id);

        if ($leave->status !== 'pending') {
            return response()->json(['message' => 'Leave request already processed'], 422);
        }

        DB::transaction(function () use ($leave, $request) {
            $leave->status = $request->status;
            $leave->admin_remarks = $request->admin_remarks;
            $leave->save();

            if ($request->status === 'approved') {
                $user = $leave->user;
                if ($user->employee) {
                    $user->employee->leave_balance -= $leave->days_count;
                    $user->employee->save();
                }
            }
        });

        return response()->json([
            'message' => 'Leave request ' . $request->status,
            'leave' => $leave
        ]);
    }
}
