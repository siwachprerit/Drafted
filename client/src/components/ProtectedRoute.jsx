// ProtectedRoute.jsx - Auth guard component
function ProtectedRoute({ user, children }) {
    if (!user) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">Please login to access this page</p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
