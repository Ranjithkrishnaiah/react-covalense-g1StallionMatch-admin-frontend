import { useEffect } from 'react';
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
import { useStallionQuery } from 'src/redux/splitEndpoints/stallionSplit'
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import StallionNewEditForm from '../../sections/@dashboard/stallion/StallionNewEditForm';

// ----------------------------------------------------------------------

export default function StallionCreate() {
  const { themeStretch } = useSettings();

  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const { id = '' } = useParams();
  
  const isEdit = pathname.includes('edit');  
  
  const { data, error, isFetching, isLoading, isSuccess } = useStallionQuery(id); 
  //const editedTitle = data.name;
  return (
    <Page title={!isEdit ? 'Create a new stallion' : 'Edit stallion'}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new stallion' : 'Edit stallion'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Stallion', href: PATH_DASHBOARD.stallions.list },
            { name: !isEdit ? 'New stallion' : capitalCase(id) },
          ]}
        />

        <StallionNewEditForm isEdit={isEdit} currentStallion={data} id={id} />
      </Container>
    </Page>
  );
}
