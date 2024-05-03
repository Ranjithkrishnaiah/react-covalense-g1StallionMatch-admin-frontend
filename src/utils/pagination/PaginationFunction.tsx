import React from 'react';
import './Pagination.css';
import { StyledEngineProvider, Stack, Pagination, PaginationItem } from '@mui/material';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { scrollToTop } from '../customFunctions';

// Pagination interface
export interface Pagination {
  itemCount: number;
  limit: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  handleRequestPagination: VoidFunction;
}

export default function PaginationSettings(props: any) {
  const data = props?.data?.pagination;
  const totalRecords = data?.itemCount ? data?.itemCount : 0;
  const pageLimit = data?.limit ? data?.limit : 0;
  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / pageLimit) : 1;

  // handle change function
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    props?.data?.setPage(value);
    props?.handleRequestPagination(value);
    scrollToTop();
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* pagination section */}
      {data?.itemCount > 0 ? (
        <Stack spacing={16} my={5} className="SDpagenation">
          <Pagination
            count={totalPages}
            variant="outlined"
            shape="rounded"
            defaultPage={props.data.page}
            page={props.data.page}
            sx={{ justifyContent: 'center', display: 'flex' }}
            onChange={handleChange}
            renderItem={(item) => (
              <PaginationItem
                components={{
                  previous: ArrowBackIosNewRoundedIcon,
                  next: ArrowForwardIosRoundedIcon,
                }}
                {...item}
              />
            )}
          />
        </Stack>
      ) : (
        ''
      )}
    </StyledEngineProvider>
  );
}
