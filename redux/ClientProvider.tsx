'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import {store} from "./store";

interface ClientWrapperProps {
    children: ReactNode;
}

const ClientWrapper = ({ children }: ClientWrapperProps) => {
    return <Provider store={store}>{children}</Provider>;
};

export default ClientWrapper;
