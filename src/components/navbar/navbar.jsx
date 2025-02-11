import './navbar.scss';
import { NavLink, useNavigate } from 'react-router-dom';
import { memo } from 'react';
import { getItemFromLocalStorage } from '../../utils/app.utils';

const LoginMenu = () => {
    const token = getItemFromLocalStorage('token');
    const isAdmin = token?.type === 'admin';

    return (
        <div className="nav-links">
            <NavLink to="/user-panel" className="nav-link">
                My Records
            </NavLink>
            {isAdmin && (
                <NavLink to="/all-records" className="nav-link">
                    System Records
                </NavLink>
            )}
            <NavLink to="/" className="nav-link" onClick={() => localStorage.removeItem('token')}>
                Logout
            </NavLink>
        </div>
    );
};

const LogoutBtn = () => (
    <div className="nav-links">
        <NavLink to="/login" className="nav-link">
            Login
        </NavLink>
    </div>
);

const MemoizedLogoutBtn = memo(LogoutBtn);
const MemoizedLoginMenu = memo(LoginMenu);

const Navbar = () => {
    const token = getItemFromLocalStorage('token');
    const navigate = useNavigate();

    const onLogoClick = () => {
        navigate(token ? '/user-panel' : '/');
    };

    return (
        <navbar className="navbar">
            <div className="logo" onClick={onLogoClick}>
                FHIR XRPL
            </div>
            {token ? <MemoizedLoginMenu /> : <MemoizedLogoutBtn />}
        </navbar>
    );
};

export default Navbar;
