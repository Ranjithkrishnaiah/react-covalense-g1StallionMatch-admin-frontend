
// @mui
import { useState } from "react";
import {
    StyledEngineProvider,
} from '@mui/material';
import Page from 'src/components/Page';
import DashboardHeader from 'src/layouts/dashboard/header';
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import { useLocation, useParams } from 'react-router-dom';
import HomeData from "./HomeData";
import MarketingStallionMatchData from "./MarketingStallionMatchData";
import MarketingTrendsData from "./MarketingTrendsData";
import MarketingReportOverviewList from "./MarketingReportOverviewList";
import MarketingFarmData from "./MarketingFarmData";
import MarketingStallionData from "./MarketingStallionData";
import MarketingRaceHorseList from "./MarketingRaceHorseList";

export default function MarketingData() {
    const { pathname } = useLocation();
    const currentPage = pathname.split("/");
    const marketingSubModule = currentPage[4];
    

    const [apiStatus, setApiStatus] = useState<boolean>(false);
    const [apiStatusMsg, setApiStatusMsg] = useState<any>({});
    const [openHeader, setOpenHeader] = useState(false);
    const { collapseClick, isCollapse } = useCollapseDrawer();
    // const verticalLayout = themeLayout === 'vertical';
    
    return (
        <StyledEngineProvider injectFirst>
            {/* Header component */}
            <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
            <Page title="Homepage" sx={{ display: 'flex' }} className='HomepageData'>
                {/* Leftbar component */}
                <MarketingFilterSidebar />
                {!marketingSubModule && <HomeData />}
                {marketingSubModule === 'stallionmatch' && <MarketingStallionMatchData />}
                {marketingSubModule === 'trends' && <MarketingTrendsData />}
                {marketingSubModule === 'reportoverview' && <MarketingReportOverviewList />}
                {marketingSubModule === 'farm' && <MarketingFarmData />}
                {marketingSubModule === 'stallion' && <MarketingStallionData />}
                {marketingSubModule === 'racehorse' && <MarketingRaceHorseList />}
            </Page>
        </StyledEngineProvider>
    );
}
