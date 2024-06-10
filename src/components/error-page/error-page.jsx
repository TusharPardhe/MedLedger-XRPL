import './error-page.scss';

import { Link } from 'react-router-dom';

const ErrorPage = () => {
    return (
        <div className="error-page">
            <div className="content">
                <h1>404</h1>
                <h2>Oops! Page not found</h2>
                <p>{`We can't find the page you're looking for`}.</p>
                <Link to="/" className="go-home">
                    Go Back
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
