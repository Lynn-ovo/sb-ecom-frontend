import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = ({ publicPage = false, adminOnly = false }) => {

    const { user } = useSelector((state) => state.auth);

    const roles = user?.roles || [];

    const isAdmin = roles.includes("ROLE_ADMIN");
    const isSeller = roles.includes("ROLE_SELLER");

    const location = useLocation();

    // login/register page
    if (publicPage) {
        return user ? <Navigate to="/" /> : <Outlet />
    }

    // not logged in
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // admin/seller protected pages only
    if (adminOnly) {

        if (!isAdmin && !isSeller) {
            return <Navigate to="/" replace />
        }

        if (isSeller && !isAdmin) {
            const sellerAllowedPaths = [
                "/admin/orders",
                "/admin/products"
            ];

            const sellerAllowed = sellerAllowedPaths.some(path =>
                location.pathname.startsWith(path)
            );

            if (!sellerAllowed) {
                return <Navigate to="/" replace />
            }
        }
    }

    return <Outlet />;
}

export default PrivateRoute;