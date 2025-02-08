import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
	Container,
	Paper,
	Typography,
	Grid,
	Box,
	Divider,
	CircularProgress,
	Alert,
	Chip,
	TextField,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import { toast } from 'react-hot-toast';

const Profile = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedProfile, setEditedProfile] = useState(null);
	const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});
	const location = useLocation();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const token = localStorage.getItem('token');
				const isStudentRoute = location.pathname === '/student/profile';
				const endpoint = isStudentRoute ? 'http://localhost:3001/api/student/profile' : 'http://localhost:3001/api/profile';
				
				const response = await axios.get(endpoint, {
					headers: { 
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				});

				setProfile(response.data);
				setError(null);
			} catch (err) {
				console.error('Profile fetch error:', err);
				setError(err.response?.data?.message || 'Failed to fetch profile');
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [location.pathname]);

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="md" sx={{ mt: 4 }}>
				<Alert severity="error">{error}</Alert>
			</Container>
		);
	}

	const renderRoleSpecificInfo = () => {
		if (profile.role === 'student') {
			return (
				<>
					<Grid item xs={12} md={6}>
						<Typography variant="subtitle1">
							<strong>Year:</strong> {profile.metadata?.year || 'Not specified'}
						</Typography>
					</Grid>
					<Grid item xs={12} md={6}>
						<Typography variant="subtitle1">
							<strong>Section:</strong> {profile.metadata?.section || 'Not specified'}
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="subtitle1">
							<strong>Student Group:</strong> {profile.metadata?.studentGroup?.name || 'Not assigned'}
						</Typography>
					</Grid>
				</>
			);
		} else if (profile.role === 'teacher') {
			return (
				<>
					<Grid item xs={12}>
						<Typography variant="subtitle1">
							<strong>Department:</strong> {profile.metadata?.department || 'Not specified'}
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="subtitle1">
							<strong>Subjects:</strong>
						</Typography>
						<Box sx={{ mt: 1 }}>
							{profile.metadata?.subjects?.map((subject) => (
								<Chip
									key={subject._id}
									label={subject.name}
									sx={{ mr: 1, mb: 1 }}
								/>
							)) || 'No subjects assigned'}
						</Box>
					</Grid>
				</>
			);
		}
		return null;
	};

	const handleEdit = () => {
		setEditedProfile({...profile});
		setIsEditing(true);
	};

	const handleSave = async () => {
		try {
			const token = localStorage.getItem('token');
			const isStudentRoute = location.pathname === '/student/profile';
			const endpoint = isStudentRoute ? 'http://localhost:3001/api/student/profile' : 'http://localhost:3001/api/profile';
			
			await axios.put(endpoint, editedProfile, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			
			setProfile(editedProfile);
			setIsEditing(false);
			toast.success('Profile updated successfully');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to update profile');
		}
	};

	const handlePasswordChange = async () => {
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const endpoint = 'http://localhost:3001/api/student/change-password';
			
			await axios.put(endpoint, {
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword
			}, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			
			setOpenPasswordDialog(false);
			setPasswordData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			});
			toast.success('Password updated successfully');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to update password');
		}
	};

	return (
		<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
					<Typography variant="h4" gutterBottom>
						Profile Information
					</Typography>
					<Box>
						<Button 
							variant="contained" 
							color="primary" 
							onClick={isEditing ? handleSave : handleEdit}
							sx={{ mr: 1 }}
						>
							{isEditing ? 'Save' : 'Edit'}
						</Button>
						{profile?.role === 'student' && (
							<Button 
								variant="outlined" 
								color="primary"
								onClick={() => setOpenPasswordDialog(true)}
							>
								Change Password
							</Button>
						)}
					</Box>
				</Box>
				<Divider sx={{ mb: 3 }} />

				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						{isEditing ? (
							<TextField
								fullWidth
								label="Name"
								value={editedProfile?.name || ''}
								onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
							/>
						) : (
							<Typography variant="subtitle1">
								<strong>Name:</strong> {profile?.name}
							</Typography>
						)}
					</Grid>
					<Grid item xs={12} md={6}>
						{isEditing ? (
							<TextField
								fullWidth
								label="Email"
								value={editedProfile?.email || ''}
								onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
							/>
						) : (
							<Typography variant="subtitle1">
								<strong>Email:</strong> {profile?.email}
							</Typography>
						)}
					</Grid>
					<Grid item xs={12} md={6}>
						<Typography variant="subtitle1">
							<strong>Role:</strong> {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
						</Typography>
					</Grid>
					{renderRoleSpecificInfo()}
					<Grid item xs={12}>
						<Typography variant="subtitle1">
							<strong>Joined:</strong> {new Date(profile?.createdAt).toLocaleDateString()}
						</Typography>
					</Grid>
				</Grid>
			</Paper>

			{/* Password Change Dialog */}
			<Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
				<DialogTitle>Change Password</DialogTitle>
				<DialogContent>
					<TextField
						margin="dense"
						label="Current Password"
						type="password"
						fullWidth
						value={passwordData.currentPassword}
						onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
					/>
					<TextField
						margin="dense"
						label="New Password"
						type="password"
						fullWidth
						value={passwordData.newPassword}
						onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
					/>
					<TextField
						margin="dense"
						label="Confirm New Password"
						type="password"
						fullWidth
						value={passwordData.confirmPassword}
						onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
					<Button onClick={handlePasswordChange} color="primary">Update Password</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Profile;