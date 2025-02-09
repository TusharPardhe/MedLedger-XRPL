import './navbar.scss';

import { Link, useNavigate } from 'react-router-dom';
import { memo } from 'react';

const LogoutBtn = () => (
    <div className="nav-links">
        <Link to="/login" className="nav-link">
            Login
        </Link>
    </div>
);

const LoginBtn = () => (
    <div className="nav-links">
        <Link to="/" className="nav-link" onClick={() => localStorage.removeItem('token')}>
            Logout
        </Link>
    </div>
);

const MemoizedLogoutBtn = memo(LogoutBtn);
const MemoizedLoginBtn = memo(LoginBtn);

const Navbar = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const onLogoClick = () => {
        navigate('/');
    };

    return (
        <navbar className="navbar">
            <div className="logo" onClick={onLogoClick}>
                FHIR XRPL
            </div>
            {token ? <MemoizedLoginBtn /> : <MemoizedLogoutBtn />}
        </navbar>
    );
};

export default Navbar;
