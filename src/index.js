import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from 'redux';
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from './reducers/redux';
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import './index.css';
import App from './App';

const middleware = [];
middleware.push(thunk);

if (process.env.NODE_ENV === "development") {
  middleware.push(logger);
}

const store = createStore(
  rootReducer,
  applyMiddleware(...middleware)
);

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById("root")
);
