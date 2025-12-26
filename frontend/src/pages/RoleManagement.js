import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../css/RoleManagement.css';

const RoleManagement = () => {
	const navigate = useNavigate();
	const [roles, setRoles] = useState([]);
	const [availablePermissions, setAvailablePermissions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRole, setEditingRole] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		permissions: []
	});

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		const user = JSON.parse(localStorage.getItem('user') || '{}');
		if (user.role !== 0 && user.user_type !== 'admin') {
			navigate('/dashboard');
			return;
		}

		fetchRoles();
		fetchAvailablePermissions();
	}, [navigate]);

	const fetchRoles = async () => {
		setLoading(true);
		setError('');

		try {
			const response = await api.get('/roles');
			
			if (response.data.success) {
				setRoles(response.data.data || []);
			} else {
				setError(response.data.message || 'Failed to fetch roles');
			}
		} catch (err) {
			console.error('Error fetching roles:', err);
			let errorMessage = err.response?.data?.message || err.message || 'Failed to load roles';
			
			// Handle 404 specifically
			if (err.response?.status === 404) {
				errorMessage = 'Roles API endpoint not found. Please ensure the backend server is running and the routes are registered.';
			} else if (err.response?.status === 403) {
				errorMessage = 'Access denied. You need admin privileges to view roles.';
			} else if (errorMessage.includes('table not found') || errorMessage.includes('migration')) {
				errorMessage = 'Roles table not found. Please run the database migration:\n\ncd backend\nnpx knex migrate:latest';
			}
			
			setError(errorMessage);
			
			if (err.response?.status === 401) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				navigate('/login');
			}
		} finally {
			setLoading(false);
		}
	};

	const fetchAvailablePermissions = async () => {
		try {
			const response = await api.get('/permissions');
			if (response.data.success) {
				setAvailablePermissions(response.data.data || []);
			}
		} catch (err) {
			console.error('Error fetching permissions:', err);
		}
	};

	const handleOpenModal = (role = null) => {
		if (role) {
			setEditingRole(role);
			setFormData({
				name: role.name,
				description: role.description || '',
				permissions: role.permissions || []
			});
		} else {
			setEditingRole(null);
			setFormData({
				name: '',
				description: '',
				permissions: []
			});
		}
		setIsModalOpen(true);
		setError('');
		setSuccess('');
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingRole(null);
		setFormData({
			name: '',
			description: '',
			permissions: []
		});
	};

	const handlePermissionToggle = (permissionKey) => {
		setFormData(prev => {
			const existing = prev.permissions.find(p => p.permission_key === permissionKey);
			if (existing) {
				return {
					...prev,
					permissions: prev.permissions.map(p =>
						p.permission_key === permissionKey
							? { ...p, has_access: !p.has_access }
							: p
					)
				};
			} else {
				return {
					...prev,
					permissions: [
						...prev.permissions,
						{ permission_key: permissionKey, has_access: true }
					]
				};
			}
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!formData.name.trim()) {
			setError('Role name is required');
			return;
		}

		try {
			// Prepare permissions array - include all available permissions
			const permissions = availablePermissions.map(perm => {
				const existingPerm = formData.permissions.find(p => p.permission_key === perm.permission_key);
				const hasAccess = existingPerm ? (existingPerm.has_access === true || existingPerm.has_access === 1 || existingPerm.has_access === '1') : false;
				return {
					permission_key: perm.permission_key,
					has_access: hasAccess
				};
			});

			console.log('Saving permissions for role:', editingRole?.id || 'new', permissions);

			if (editingRole) {
				// Prepare update data
				const updateData = {
					description: formData.description,
					permissions: permissions
				};
				
				// Only include name if it's a custom role (not Admin id:0 or Volunteer id:1)
				// For Admin and Volunteer, don't send name to avoid validation errors
				if (editingRole.id !== 0 && editingRole.id !== 1) {
					updateData.name = formData.name;
				}
				
				// Update role
				const response = await api.put(`/roles/${editingRole.id}`, updateData);

				if (response.data.success) {
					setSuccess('Role updated successfully!');
					fetchRoles();
					
					// Trigger sidebar refresh to update menu items
					window.dispatchEvent(new Event('permissionsUpdated'));
					console.log('[ROLE MANAGEMENT] Dispatched permissionsUpdated event');
					
					setTimeout(() => {
						handleCloseModal();
					}, 1000);
				}
			} else {
				// Create role
				const response = await api.post('/roles', {
					name: formData.name,
					description: formData.description,
					permissions: permissions
				});

				if (response.data.success) {
					setSuccess('Role created successfully!');
					fetchRoles();
					
					// Trigger sidebar refresh to update menu items
					window.dispatchEvent(new Event('permissionsUpdated'));
					console.log('[ROLE MANAGEMENT] Dispatched permissionsUpdated event');
					
					setTimeout(() => {
						handleCloseModal();
					}, 1000);
				}
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save role');
		}
	};

	const handleDelete = async (role) => {
		if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
			return;
		}

		try {
			const response = await api.delete(`/roles/${role.id}`);
			if (response.data.success) {
				setSuccess('Role deleted successfully!');
				fetchRoles();
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to delete role');
		}
	};

	if (loading) {
		return (
			<div className="roles-container">
				<div className="roles-loading">Loading roles...</div>
			</div>
		);
	}

	return (
		<div className="roles-container">
			<div className="roles-card">
				<div className="roles-header">
					<h2>Role Management</h2>
					<button
						onClick={() => handleOpenModal()}
						className="create-role-btn"
					>
						<span>+</span>
						<span>Create New Role</span>
					</button>
				</div>

				{error && (
					<div className="roles-error-message">
						<strong>Error:</strong> {error}
					</div>
				)}
				{success && (
					<div className="roles-success-message">
						{success}
					</div>
				)}

				<div className="roles-table-wrapper">
					<table className="roles-table">
						<thead>
							<tr>
								<th>Role Name</th>
								<th>Description</th>
								<th>Type</th>
								<th>Permissions</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{roles.length === 0 ? (
								<tr>
									<td colSpan="6" className="no-data">
										<div>No roles found. Create your first role!</div>
									</td>
								</tr>
							) : (
								roles.map((role) => (
									<tr key={role.id}>
										<td>
											<div className="role-name-cell">
												<div className="role-name">
													{role.name}
													
												</div>
											</div>
										</td>
										<td>
											<div className="role-description">
												{role.description || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No description</span>}
											</div>
										</td>
										<td>
											<span className={`role-type ${role.is_system_role ? 'system' : 'custom'}`}>
												{role.id === 0 ? 'Admin Role (Cannot Delete)' : 
												 role.id === 1 ? 'Volunteer Role (Cannot Delete)' :
												 role.is_system_role ? 'System Role' : 'Custom Role'}
											</span>
										</td>
										<td>
											<div className="permissions-count">
												{role.permissions?.filter(p => p.has_access).length || 0}
												<span> / {availablePermissions.length}</span>
											</div>
										</td>
										
										<td>
											<div className="action-buttons">
												<button
													onClick={() => handleOpenModal(role)}
													className="edit-btn"
													title={role.id === 0 ? 'Admin: Can edit description and permissions only' : role.id === 1 ? 'Volunteer: Can edit description and permissions only' : 'Edit role'}
												>
													Edit
												</button>
												{/* Only show delete button for custom roles (not Admin id:0 or Volunteer id:1) */}
												{role.id !== 0 && role.id !== 1 && (
													<button
														onClick={() => handleDelete(role)}
														className="delete-btn"
														title="Delete custom role"
													>
														Delete
													</button>
												)}
												{(role.id === 0 || role.id === 1) && (
													<span style={{ 
														fontSize: '12px', 
														color: '#6b7280', 
														marginLeft: '8px',
														fontStyle: 'italic'
													}}>
														Protected
													</span>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && (
				<div 
					className="roles-modal-overlay" 
					onClick={handleCloseModal}
				>
					<div 
						className="roles-modal-content" 
						onClick={(e) => e.stopPropagation()}
					>
						<div className="roles-modal-header">
							<h2>{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
							<button
								onClick={handleCloseModal}
								className="roles-modal-close-btn"
							>
								×
							</button>
						</div>

						<form onSubmit={handleSubmit}>
							<div className="roles-form-group">
								<label htmlFor="role-name">
									Role Name *
								</label>
								<input
									id="role-name"
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									disabled={editingRole?.id === 0 || editingRole?.id === 1}
									placeholder="e.g., Manager, Editor, Viewer"
									required
								/>
								{(editingRole?.id === 0 || editingRole?.id === 1) && (
									<small style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px', display: 'block' }}>
										{editingRole?.id === 0 ? 'Admin role cannot be renamed' : 'Volunteer role cannot be renamed'}
									</small>
								)}
							</div>

							<div className="roles-form-group">
								<label htmlFor="role-description">
									Description
								</label>
								<textarea
									id="role-description"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Provide a brief description of this role's purpose and responsibilities..."
									rows={4}
								/>
							</div>

							<div className="roles-form-group">
								<label>
									Permissions
									<span style={{ 
										marginLeft: '8px', 
										fontSize: '13px', 
										fontWeight: '400', 
										color: '#6b7280' 
									}}>
										({formData.permissions.filter(p => p.has_access).length} of {availablePermissions.length} selected)
									</span>
								</label>
								{availablePermissions.length === 0 ? (
									<div style={{ 
										padding: '20px', 
										textAlign: 'center', 
										color: '#6b7280',
										background: '#f9fafb',
										borderRadius: '12px',
										border: '2px dashed #e5e7eb'
									}}>
										No permissions available. Please run database migration to add fixed permissions.
									</div>
								) : (
									<div className="permissions-list">
										{availablePermissions.map((perm) => {
											const hasAccess = formData.permissions.find(p => p.permission_key === perm.permission_key)?.has_access || false;
											return (
												<div
													key={perm.permission_key}
													className={`permission-item ${hasAccess ? 'permission-item-selected' : ''}`}
													onClick={() => handlePermissionToggle(perm.permission_key)}
												>
													<input
														type="checkbox"
														checked={hasAccess}
														onChange={() => handlePermissionToggle(perm.permission_key)}
														onClick={(e) => e.stopPropagation()}
													/>
													<div className="permission-item-info">
														<div className="permission-item-name">
															{perm.permission_name}
															{perm.is_fixed && (
																<span style={{ 
																	marginLeft: '8px', 
																	fontSize: '11px', 
																	color: '#6b7280',
																	fontStyle: 'italic'
																}}>
																	(System)
																</span>
															)}
														</div>
														<div className="permission-item-desc">
															{perm.description || perm.permission_key}
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>

							{error && (
								<div className="roles-error-message">
									{error}
								</div>
							)}
							{success && (
								<div className="roles-success-message">
									{success}
								</div>
							)}

							<div className="roles-modal-actions">
								<button
									type="button"
									onClick={handleCloseModal}
									className="cancel-btn"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="submit-btn"
								>
									{editingRole ? 'Update Role' : 'Create Role'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default RoleManagement;

