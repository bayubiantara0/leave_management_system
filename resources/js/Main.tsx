import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DepartmentList from "./pages/Departments/DepartmentList";
import DepartmentForm from "./pages/Departments/DepartmentForm";
import UserList from "./pages/Users/UserList";
import UserForm from "./pages/Users/UserForm";
import LeaveList from "./pages/Leaves/LeaveList";
import LeaveForm from "./pages/Leaves/LeaveForm";
import LeaveApproval from "./pages/Leaves/LeaveApproval";
import RoleList from "./pages/Roles/RoleList";
import RoleForm from "./pages/Roles/RoleForm";
import PermissionList from "./pages/Roles/PermissionList";
import PermissionForm from "./pages/Roles/PermissionForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Main: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />

                            {/* Permission Based Routes */}

                            {/* Departments */}
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="view_departments" />
                                }
                            >
                                <Route
                                    path="/departments"
                                    element={<DepartmentList />}
                                />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="create_departments" />
                                }
                            >
                                <Route
                                    path="/departments/create"
                                    element={<DepartmentForm />}
                                />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="edit_departments" />
                                }
                            >
                                <Route
                                    path="/departments/:id/edit"
                                    element={<DepartmentForm />}
                                />
                            </Route>

                            {/* Users */}
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="view_users" />
                                }
                            >
                                <Route path="/users" element={<UserList />} />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="create_users" />
                                }
                            >
                                <Route
                                    path="/users/create"
                                    element={<UserForm />}
                                />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="edit_users" />
                                }
                            >
                                <Route
                                    path="/users/:id/edit"
                                    element={<UserForm />}
                                />
                            </Route>

                            {/* Roles */}
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="view_roles" />
                                }
                            >
                                <Route path="/roles" element={<RoleList />} />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="create_roles" />
                                }
                            >
                                <Route
                                    path="/roles/create"
                                    element={<RoleForm />}
                                />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="edit_roles" />
                                }
                            >
                                <Route
                                    path="/roles/:id/edit"
                                    element={<RoleForm />}
                                />
                            </Route>

                            {/* Permissions */}
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="view_permissions" />
                                }
                            >
                                <Route
                                    path="/permissions"
                                    element={<PermissionList />}
                                />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="create_permissions" />
                                }
                            >
                                <Route
                                    path="/permissions/create"
                                    element={<PermissionForm />}
                                />
                            </Route>
                            {/* Note: Edit pemission typically strict/disabled or just name change */}

                            {/* Leaves */}
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="view_own_leaves" />
                                }
                            >
                                <Route path="/leaves" element={<LeaveList />} />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="create_leaves" />
                                }
                            >
                                <Route
                                    path="/leaves/apply"
                                    element={<LeaveForm />}
                                />
                            </Route>
                            <Route
                                element={
                                    <ProtectedRoute requiredPermission="approve_leaves" />
                                }
                            >
                                <Route
                                    path="/leaves/approvals"
                                    element={<LeaveApproval />}
                                />
                            </Route>
                        </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default Main;
