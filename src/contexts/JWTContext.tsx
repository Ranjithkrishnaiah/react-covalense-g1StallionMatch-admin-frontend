import { createContext, ReactNode, useEffect, useReducer } from 'react';
// utils
import axios from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';

// @types
import { ActionMap, AuthState, AuthUser, JWTContextType } from '../@types/auth';
import React from 'react'
// ----------------------------------------------------------------------
const AuthContext = createContext<JWTContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

const USER = localStorage.getItem('user')
const TOKEN = localStorage.getItem('accessToken')
function AuthProvider({ children }: AuthProviderProps) {
  //const [state, dispatch] = useReducer(JWTReducer, initialState);
  // const [authentication, setAuthentication] = React.useState(TOKEN? true: false)
  const [authentication, setAuthentication] = React.useState(TOKEN?isValidToken(TOKEN) ? true : false : false);
  const [user, setUser] = React.useState<string | null>(USER);
  const [logout, setLogout] = React.useState(false);
  const accessToken = window.localStorage.getItem('accessToken');

  const onLogout = () => {
    
    if(logout){
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('user');
      window.localStorage.removeItem("fullName");
      window.localStorage.removeItem("roleName");
      setSession(null)
      setAuthentication(false)
      setUser(null)
      setLogout(false)
    }
  }  

  useEffect(() => {
    const initialize = async () => {
      try {
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
        } else {
          onLogout()
        }
      } catch (err) {
        console.error(err);
        window.localStorage.removeItem("accessToken")
        setAuthentication(false)
        setSession(null)
      }
    };

    initialize();
    onLogout()
  }, [logout, isValidToken(accessToken? accessToken:"")]);

  return (
    <AuthContext.Provider
      value={{
        method: 'jwt',
        authentication,
        setAuthentication,
        user,
        setUser,
        setLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export { AuthContext, AuthProvider };
