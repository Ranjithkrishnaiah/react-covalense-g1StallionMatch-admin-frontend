import React from 'react'; 
import { Stack, Typography, Link } from '@mui/material';
import './Pagination.css';
import { scrollToTop } from '../customFunctions';

export default function PaginationLimit(props:any) {
    const data = props?.data?.pagination; 
    const itemCount = data?.itemCount; 
    // clear pagination hook
    React.useEffect(() => {
        if(props?.data?.clear) {
          props?.data?.setPage(1);
        }
      }, [props?.data]);

      // pageState state
      const [pageState, setPageStateValue] = React.useState({
        limit20: "active",
        limit25: "",
        limit50: "",
        limit100: ""
      });
      const [isLimitChanged, setIsLimitChanged] = React.useState(false);
      
    // handels page limt and refetch the data
    const handlePageLimit = (pageLimit: number) => {
        props?.setLimit(pageLimit);
        props?.handleRequestPaginationLimit(pageLimit);
        props?.data?.setPage(1);
        setIsLimitChanged(true);
        scrollToTop();     
    } 

    // set page state value hook
    React.useEffect(() => {
      setPageStateValue({
        ...pageState,
        limit20: (props?.limit === 15) ? "active" : "",
        limit25: (props?.limit === 25) ? "active" : "",
        limit50: (props?.limit === 50) ? "active" : "",
        limit100: (props?.limit === 100) ? "active" : "",
      }); 
    }, [isLimitChanged]);
    
    return (
        <Stack className='Pagination-Count'>
            <Typography>
                <Link className={pageState?.limit20} href="#" onClick={() => handlePageLimit(15)}>Default</Link>/
                <Link className={pageState?.limit25} href="#" onClick={() => ( itemCount > 15) ? handlePageLimit(25) : void(0)}>25</Link>/
                <Link className={pageState?.limit50} href="#" onClick={() => ( itemCount > 25) ? handlePageLimit(50) : void(0)}>50</Link>/
                <Link className={pageState?.limit100} href="#" onClick={() => ( itemCount > 50) ? handlePageLimit(100) : void(0)}>100</Link>
            </Typography>
        </Stack>
    );
}