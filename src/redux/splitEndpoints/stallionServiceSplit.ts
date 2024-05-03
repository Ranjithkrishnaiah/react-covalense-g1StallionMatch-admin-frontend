import { fetchData } from "./index";

export const getStallionById = (id:any) => fetchData({url: `stallions/${id}`, method: 'GET'});
export const getStateById = (id:any) => fetchData({url: `states/by-country/${id}`, method: 'GET'});

export const createStallion = (data:any) => fetchData({url: `stallions`, method: 'POST' , body : data});
export const updateStallion = (id: any, data: any) => fetchData({url: `stallions/${id}`, method: 'PATCH' , body : data});


