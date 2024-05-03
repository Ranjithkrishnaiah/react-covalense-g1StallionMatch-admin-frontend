
import axios from 'axios';
import { api } from "../../api/apiPaths";
const accessToken = localStorage.getItem('accessToken');
axios.defaults.baseURL = api.baseUrl;

axios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return  error.response;
  }
);

export const fetchData = async (axiosParams:any) => {
  const {
    url,
    method = 'POST',
    body = {},
    disableSpinner = false,
  } = axiosParams;
    // axios.defaults.headers.common.Authorization = `Bearer ${(accessToken)}`;

  if (method === 'POST') {
    return axios(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(accessToken)}`
      },
      data: JSON.stringify(body)
    });
  }

  if (method === 'PATCH') {
    return axios(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(accessToken)}`
      },
      data: JSON.stringify(body)
    });
  }

  if (method === 'GET') {
    return axios(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${(accessToken)}`,
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',        
      }
    });
  }

  if (method === 'DELETE') {
    return axios(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(accessToken)}`
      },
      data: JSON.stringify(body)
    });
  }
};
