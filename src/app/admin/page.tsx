"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { useTranslations } from "../../i18n/TranslationsProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ThemeToggle } from "../../components/ThemeToggle";

interface User {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
  levelAccess: {
    level1: boolean;
    level2: boolean;
    level3: boolean;
  };
  createdAt: string;
  deviceId?: string;
  passportFullName?: string;
  passportNumber?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTests: number;
  averageScore: number;
  levelStats: Array<{
    _id: number;
    count: number;
    avgScore: number;
  }>;
  recentTests: Array<{
    _id: string;
    userId: {
      username: string;
    };
    level: number;
    type: string;
    score: number;
    createdAt: string;
  }>;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "stats">(
    "dashboard",
  );
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    checkAuth();
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "stats" || activeTab === "dashboard") {
      fetchStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.passportFullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          (user.passportNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const checkAuth = async () => {
    try {
      const response = await api.get(`/auth/me`);
      if (response.data.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser(response.data.user);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users`);
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await api.post(`/admin/users`, userData);
      setShowCreateUser(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await api.put(`/admin/users/${userId}`, updates);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleResetDevice = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/reset-device`, {});
      fetchUsers();
    } catch (error) {
      console.error("Failed to reset device:", error);
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    try {
      await api.put(`/admin/users/${targetUser._id}`, {
        isActive: !targetUser.isActive,
      });
      fetchUsers();
      if (activeTab === "dashboard") fetchStats();
    } catch (error) {
      console.error("Failed to toggle user active status:", error);
    }
  };

  const handleToggleLevelAccess = async (
    targetUser: User,
    levelKey: "level1" | "level2" | "level3",
  ) => {
    try {
      await api.put(`/admin/users/${targetUser._id}/level-access`, {
        [levelKey]: !targetUser.levelAccess[levelKey],
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update level access:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post(`/auth/logout`, {});
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleResetAllDevices = async () => {
    if (
      confirm(
        "Are you sure you want to reset all user devices? This will log out all users.",
      )
    ) {
      try {
        await api.post(`/admin/reset-all-devices`, {});
        fetchUsers();
        alert("All devices have been reset successfully");
      } catch (error) {
        console.error("Failed to reset all devices:", error);
        alert("Failed to reset all devices");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <span className="text-gray-700 dark:text-gray-300">
                Admin: {user?.username}
              </span>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition dark:bg-red-600 dark:hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "users", label: "User Management" },
              { id: "stats", label: "Statistics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:border-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-400 dark:hover:border-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 dark:shadow-gray-700">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats?.totalUsers ?? "—"}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Total Users
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 dark:shadow-gray-700">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats?.activeUsers ?? "—"}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Active Users
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 dark:shadow-gray-700">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats?.totalTests ?? "—"}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Total Tests
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 dark:shadow-gray-700">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {stats ? `${Math.round(stats.averageScore)}%` : "—"}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Average Score
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow dark:bg-gray-800 dark:shadow-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  User Management
                </h2>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by username, passport name, passport number, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleResetAllDevices}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Reset All Devices
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Passport Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Passport Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Level Access
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.passportFullName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.passportNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex space-x-2">
                          {(["level1", "level2", "level3"] as const).map(
                            (levelKey, idx) => {
                              const enabled = user.levelAccess[levelKey];
                              const label = `L${idx + 1}`;
                              return (
                                <button
                                  key={levelKey}
                                  onClick={() =>
                                    handleToggleLevelAccess(user, levelKey)
                                  }
                                  className={`px-2 py-1 text-xs rounded transition ${
                                    enabled
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                  }`}
                                  title="Toggle level access"
                                  type="button"
                                >
                                  {label}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.deviceId ? "🟢 Active" : "🔴 None"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                            title={
                              user.isActive ? "Disable user" : "Enable user"
                            }
                          >
                            {user.isActive ? "Disable" : "Enable"}
                          </button>
                          {user.deviceId && (
                            <button
                              onClick={() => handleResetDevice(user._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Reset device"
                            >
                              Reset Device
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 dark:shadow-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Recent Test Results
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {stats?.recentTests?.map((test) => (
                      <tr key={test._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {test.userId.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          Level {test.level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {test.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              test.score >= 80
                                ? "bg-green-100 text-green-800"
                                : test.score >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {test.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats?.levelStats?.map((stat) => (
                <div
                  key={stat._id}
                  className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 dark:shadow-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Level {stat._id} Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Tests Taken
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {stat.count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Average Score
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {Math.round(stat.avgScore)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create/Edit User Modal */}
      {(showCreateUser || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowCreateUser(false);
            setEditingUser(null);
          }}
          onSubmit={
            editingUser
              ? (data) => handleUpdateUser(editingUser._id, data)
              : handleCreateUser
          }
        />
      )}
    </div>
  );
}

function UserModal({
  user,
  onClose,
  onSubmit,
}: {
  user: User | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    password: "",
    role: user?.role || "user",
    isActive: user?.isActive ?? true,
    levelAccess: user?.levelAccess || {
      level1: false,
      level2: false,
      level3: false,
    },
    passportFullName: user?.passportFullName || "",
    passportNumber: user?.passportNumber || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {user ? "Edit User" : "Create User"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passport Full Name
            </label>
            <input
              type="text"
              value={formData.passportFullName}
              onChange={(e) =>
                setFormData({ ...formData, passportFullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter full name as in passport"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passport Number
            </label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) =>
                setFormData({ ...formData, passportNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter passport number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.isActive.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level Access
            </label>
            <div className="space-y-2">
              {["level1", "level2", "level3"].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      formData.levelAccess[
                        level as keyof typeof formData.levelAccess
                      ]
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        levelAccess: {
                          ...formData.levelAccess,
                          [level]: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {user ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
