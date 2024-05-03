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
import { useMemberQuery } from 'src/redux/splitEndpoints/memberSplit'
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import MemberNewEditForm from 'src/sections/@dashboard/member/MemberNewEditForm';

// ----------------------------------------------------------------------

export default function MemberCreate() {
  const { themeStretch } = useSettings();

  const dispatch = useDispatch();

  const { pathname } = useLocation();

  const { id = '' } = useParams();
  
  const isEdit = pathname.includes('edit');  
  
  const { data, error, isFetching, isLoading, isSuccess } = useMemberQuery(id); 
  //const editedTitle = data.name;
  return (
    <Page title={!isEdit ? 'Create a new member' : 'Edit member'}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new member' : 'Edit member'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Member', href: PATH_DASHBOARD.members.list },
            { name: !isEdit ? 'New member' : capitalCase(id) },
          ]}
        />

        <MemberNewEditForm isEdit={isEdit} currentMember={data} id={id} />
      </Container>
    </Page>
  );
}
