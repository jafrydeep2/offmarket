import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
	children: React.ReactElement;
}

const RequireAdmin: React.FC<Props> = ({ children }) => {
	const { isAuthenticated, isAdmin, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) return children; // or a loader
	if (!isAuthenticated || !isAdmin) {
		return <Navigate to="/admin/login" state={{ from: location }} replace />;
	}

	return children;
};

export default RequireAdmin;


