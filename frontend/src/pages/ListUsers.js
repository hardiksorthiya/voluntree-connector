import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { SearchIcon, EditIcon, UserIcon, TrashIcon } from '../components/Icons';
import RoleEditModal from '../components/RoleEditModal';
import UserEditModal from '../components/UserEditModal';
import '../css/UsersList.css';

const UsersList = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [selectedUser, setSelectedUser] = useState(null);
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [success, setSuccess] = useState('');
	const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		fetchRoles();
		checkPermissionAndFetchUsers();
	}, [navigate]);

	const fetchRoles = async () => {
		try {
			const response = await api.get('/roles');
			if (response.data.success) {
				setRoles(response.data.data || []);
			}
		} catch (err) {
			console.error('Error fetching roles:', err);
			// Don't show error to user, just log it - roles will use fallback
		}
	};

	const checkPermissionAndFetchUsers = async () => {
		try {
			// Check if user has permission to access user management
			const permissionResponse = await api.get('/permissions/check/user_management');
			
			if (permissionResponse.data.success && permissionResponse.data.hasAccess) {
				fetchUsers();
			} else {
				setError('Access denied. You do not have permission to view user management.');
				setLoading(false);
			}
		} catch (err) {
			console.error('Error checking permission:', err);
			// If permission check fails (e.g., table doesn't exist), try to fetch users anyway
			// Backend will handle the permission check and allow admins through
			if (err.response?.status === 403) {
				setError('Access denied. You do not have permission to view user management.');
				setLoading(false);
			} else {
				// Try to fetch users - backend will handle permission check
				// This handles cases where the permissions table doesn't exist yet
				fetchUsers();
			}
		}
	};

	const fetchUsers = async () => {
		setLoading(true);
		setError('');

		try {
			const response = await api.get('/users');
			
			if (response.data.success) {
				// Backend returns { success: true, data: users }
				const usersList = response.data.data || [];
				setUsers(usersList);
			} else {
				setError(response.data.message || 'Failed to fetch users');
				setUsers([]);
			}
		} catch (err) {
			console.error('Error fetching users:', err);
			console.error('Error details:', {
				status: err.response?.status,
				message: err.response?.data?.message,
				user: JSON.parse(localStorage.getItem('user') || '{}')
			});
			let errorMessage = err.response?.data?.message || err.message || 'Failed to load users';
			
			// Check if it's a migration issue
			if (errorMessage.includes('migration') || errorMessage.includes('table not found')) {
				errorMessage = 'Permissions table not found. Please run database migration:\n\ncd backend\nnpx knex migrate:latest';
			}
			
			setError(errorMessage);
			setUsers([]);
			
			// Only redirect on 401 (unauthorized), show error for 403 (forbidden)
			if (err.response?.status === 401) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			} else if (err.response?.status === 403) {
				// For 403, show error but don't redirect - user might have wrong permissions
				setError('Access denied. You do not have permission to view user management.');
			}
		} finally {
			setLoading(false);
		}
	};

	const filteredUsers = users.filter((user) =>
		user.name?.toLowerCase().includes(search.toLowerCase()) ||
		user.email?.toLowerCase().includes(search.toLowerCase())
	);

	const handleRoleEdit = (user) => {
		setSelectedUser(user);
		setIsRoleModalOpen(true);
	};

	const handleRoleUpdate = () => {
		fetchUsers();
		setSuccess('Role updated successfully!');
		setTimeout(() => setSuccess(''), 3000);
	};

	const handleEditUser = (user) => {
		setSelectedUser(user);
		setIsEditModalOpen(true);
	};

	const handleUserUpdate = () => {
		fetchUsers();
		setSuccess('User updated successfully!');
		setTimeout(() => setSuccess(''), 3000);
	};

	const handleToggleStatus = async (user) => {
		if (!window.confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.name}?`)) {
			return;
		}

		try {
			const response = await api.put(`/users/${user.id}/status`, {
				is_active: !user.is_active
			});

			if (response.data.success) {
				setSuccess(response.data.message);
				fetchUsers();
				setTimeout(() => setSuccess(''), 3000);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to update user status');
			setTimeout(() => setError(''), 5000);
		}
	};

	const handleDeleteUser = async (user) => {
		if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
			return;
		}

		try {
			const response = await api.delete(`/users/${user.id}`);

			if (response.data.success) {
				setSuccess('User deleted successfully!');
				fetchUsers();
				setTimeout(() => setSuccess(''), 3000);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to delete user');
			setTimeout(() => setError(''), 5000);
		}
	};

	const getRoleName = (roleId) => {
		const role = roles.find(r => r.id === roleId);
		if (role) return role.name;
		// Fallback for legacy roles
		return roleId === 0 ? 'Admin' : roleId === 1 ? 'Volunteer' : 'Unknown';
	};

	const getRoleBadgeClass = (roleId) => {
		const role = roles.find(r => r.id === roleId);
		if (role) {
			// Use role name for class (e.g., "admin" -> "role-badge-admin")
			return `role-badge-${role.name.toLowerCase().replace(/\s+/g, '-')}`;
		}
		// Fallback for legacy roles
		return roleId === 0 ? 'role-badge-admin' : 'role-badge-volunteer';
	};

	if (loading) {
		return (
			<div className="users-container">
				<div className="loading">Loading users...</div>
			</div>
		);
	}

	return (
		<div className="users-container">
			<div className="users-card">
				<div className="users-header">
					<h2>Users List</h2>

					<div className="users-search">
						<SearchIcon className="search-icon" />
						<input
							type="text"
							placeholder="Search users..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				{error && (
					<div className="error-message" style={{ 
						whiteSpace: 'pre-line', 
						padding: '16px', 
						background: '#fdecea', 
						color: '#b42318', 
						borderRadius: '8px', 
						marginBottom: '20px',
						border: '1px solid #fecdca'
					}}>
						<strong>Error:</strong> {error}
					</div>
				)}

				{success && (
					<div className="success-message">
						{success}
					</div>
				)}

				<div className="users-table-wrapper">
					<table className="users-table">
						<thead>
							<tr>
								<th>User</th>
								<th>Email</th>
								<th>Phone</th>
								<th>Role</th>
								<th>Status</th>
								<th>Action</th>
							</tr>
						</thead>

						<tbody>
							{filteredUsers.length === 0 ? (
								<tr>
									<td colSpan="6" className="no-data">
										No users found
									</td>
								</tr>
							) : (
								filteredUsers.map((user) => (
									<tr key={user.id}>
										<td className="user-cell">
											<div className="user-avatar">
												{user.name ? user.name.charAt(0).toUpperCase() : <UserIcon />}
											</div>
											<span>{user.name || 'N/A'}</span>
										</td>

										<td>{user.email || '-'}</td>
										<td>{user.phone || '-'}</td>

										<td>
											<span 
												className={`role-badge ${getRoleBadgeClass(user.role)}`}
												onClick={() => handleRoleEdit(user)}
												style={{ cursor: 'pointer' }}
												title="Click to edit role"
											>
												{getRoleName(user.role)}
											</span>
										</td>

										<td>
											<span 
												className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}
												onClick={() => handleToggleStatus(user)}
												style={{ 
													cursor: currentUser.id === user.id ? 'not-allowed' : 'pointer',
													opacity: currentUser.id === user.id ? 0.6 : 1
												}}
												title={currentUser.id === user.id ? 'Cannot change your own status' : 'Click to toggle status'}
											>
												{user.is_active ? 'Active' : 'Inactive'}
											</span>
										</td>

										<td>
											<div className="action-buttons">
												<button
													className="action-btn edit-action-btn"
													onClick={() => handleEditUser(user)}
													title="Edit user details"
												>
													<EditIcon />
												</button>
												<button
													className="action-btn delete-action-btn"
													onClick={() => handleDeleteUser(user)}
													disabled={currentUser.id === user.id}
													title={currentUser.id === user.id ? 'Cannot delete your own account' : 'Delete user'}
													style={{ 
														opacity: currentUser.id === user.id ? 0.5 : 1,
														cursor: currentUser.id === user.id ? 'not-allowed' : 'pointer'
													}}
												>
													<TrashIcon />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{selectedUser && (
				<>
					<RoleEditModal
						user={selectedUser}
						isOpen={isRoleModalOpen}
						onClose={() => {
							setIsRoleModalOpen(false);
							setSelectedUser(null);
						}}
						onUpdate={handleRoleUpdate}
					/>
					<UserEditModal
						user={selectedUser}
						isOpen={isEditModalOpen}
						onClose={() => {
							setIsEditModalOpen(false);
							setSelectedUser(null);
						}}
						onUpdate={handleUserUpdate}
					/>
				</>
			)}
		</div>
	);
};

export default UsersList;
