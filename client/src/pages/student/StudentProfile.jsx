import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';
import StudentNavbar from '../../components/navbar/StudentNavbar';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaUserGraduate, FaCalendarAlt, FaIdBadge } from 'react-icons/fa';

const StudentProfile = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await axios.get('/api/users/me');  // Update endpoint
				console.log('Profile response:', response.data);
				setProfile(response.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching profile:', error);
				toast.error('Failed to load profile');
				setLoading(false);
			}
		};
		fetchProfile();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100">
				<StudentNavbar />
				<div className="container mx-auto p-6">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<StudentNavbar />
			<div className="container mx-auto p-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
					<p className="mt-2 text-sm text-gray-600">View your personal and academic information</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Personal Information Card */}
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-6 flex items-center text-indigo-700">
							<FaUser className="mr-2" />
							Personal Information
						</h2>
						<div className="space-y-4">
							<div className="flex items-center p-4 bg-gray-50 rounded-lg">
								<FaUser className="text-gray-400 mr-3 w-5 h-5" />
								<div>
									<p className="text-sm text-gray-500">Full Name</p>
									<p className="font-medium">{profile?.name}</p>
								</div>
							</div>
							<div className="flex items-center p-4 bg-gray-50 rounded-lg">
								<FaEnvelope className="text-gray-400 mr-3 w-5 h-5" />
								<div>
									<p className="text-sm text-gray-500">Email Address</p>
									<p className="font-medium">{profile?.email}</p>
								</div>
							</div>
							<div className="flex items-center p-4 bg-gray-50 rounded-lg">
								<FaIdBadge className="text-gray-400 mr-3 w-5 h-5" />
								<div>
									<p className="text-sm text-gray-500">Role</p>
									<p className="font-medium capitalize">{profile?.role}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Academic Information Card */}
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-6 flex items-center text-indigo-700">
							<FaUserGraduate className="mr-2" />
							Academic Information
						</h2>
						<div className="space-y-4">
							<div className="flex items-center p-4 bg-gray-50 rounded-lg">
								<FaUserGraduate className="text-gray-400 mr-3 w-5 h-5" />
								<div>
									<p className="text-sm text-gray-500">Student Group</p>
									<p className="font-medium">{profile?.metadata?.studentGroup?.name || 'Not Assigned'}</p>
								</div>
							</div>
							<div className="flex items-center p-4 bg-gray-50 rounded-lg">
								<FaCalendarAlt className="text-gray-400 mr-3 w-5 h-5" />
								<div>
									<p className="text-sm text-gray-500">Academic Year</p>
									<p className="font-medium">{profile?.metadata?.year || 'Not Available'}</p>
								</div>
							</div>
							<div className="flex items-center p-4 bg-gray-50 rounded-lg">
								<FaUserGraduate className="text-gray-400 mr-3 w-5 h-5" />
								<div>
									<p className="text-sm text-gray-500">Section</p>
									<p className="font-medium">{profile?.metadata?.section || 'Not Available'}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentProfile;