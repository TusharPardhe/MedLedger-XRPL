// app.context.js

import { createContext, useState } from 'react';

import PropTypes from 'prop-types';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [globalState, setGlobalState] = useState(null);

    return <AppContext.Provider value={{ globalState, setGlobalState }}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };

AppProvider.propTypes = {
    children: PropTypes.any,
};
