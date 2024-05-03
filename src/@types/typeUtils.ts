import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import React, { Dispatch, ReactChild, SetStateAction, SyntheticEvent } from 'react';
export type ReactChildProp = {
  children: ReactChild;
};

export type EventProp = SyntheticEvent;

export type VoidFunctionType = () => void;

export type VoidFunctionOneStringArg = (any: string) => void;

