import { useEffect, useState } from 'react';
import { paramCase, capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useHorseQuery } from 'src/redux/splitEndpoints/horseSplit'
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import HorseNewEditForm from '../../sections/@dashboard/horse/HorseNewEditForm';
import HorseEditModal from 'src/sections/@dashboard/horse/HorseEditModal';
import { Box } from '@mui/material';
import { Spinner } from 'src/components/Spinner';
import HorseNewEditCForm from 'src/sections/@dashboard/horse/HorseNewEditCForm';
import { HorseSpinner } from 'src/components/HorseSpinner';
// ----------------------------------------------------------------------

type PedigreeProps = {
  horseId: string;
  horseName: string;
  colorCode?: string;
  tag?: string;   
  countryId?: number;
  progenyId?: number;
  yob?: number;
  isLocked?: boolean;
  horseTypeId?: number;
  generation?: number;
  sex?: string;
  gelding?: boolean;
  colourId?: number;
  cob?: string;
  children?: [];
}



export default function HorseCCreate() {

  const { themeStretch } = useSettings();

  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const { id = '' } = useParams();
  
  const isEdit = pathname.includes('cedit');    
  
  const data = useHorseQuery(id, {skip: (!isEdit)});
  
  return (
      <Page title={!isEdit ? 'Create a new horse' : 'Edit horse'} sx={{display: 'flex'}}>  
      <HorseEditModal horseId={id} currentHorse={data?.data} isEdit={isEdit} genId={0} progenyId={0} />    
      <Container maxWidth={themeStretch ? false : 'lg'} className='datalist'>
        {
          data?.isLoading ?
            <Box className='Spinner-Wrp'> <HorseSpinner /> </Box> : 
         data?.isSuccess && 
         <HorseNewEditCForm isEdit={isEdit} id={id} />
        } 
      </Container>
    </Page>
  );
}
