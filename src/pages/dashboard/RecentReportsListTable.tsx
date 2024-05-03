import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
import {
    Box,
    Card,
    Table,
    Button,
    Switch,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Container,
    IconButton,
    TableContainer,
    TablePagination,
    FormControlLabel,
    StyledEngineProvider,
    Fade,
    Popper,
    MenuItem,
    Divider,
    styled,
    Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// redux
import { useDispatch, useSelector } from 'react-redux';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';

import { Spinner } from 'src/components/Spinner';
import ViewDetailsModal from 'src/sections/@dashboard/reports/ViewDetailsModal';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import { getRecentReportList, getReportOrderbyId } from 'src/redux/splitEndpoints/reportServicesSplit';
// components
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import ReactToPdf from "react-to-pdf";

const ref: any = React.createRef();

// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        background: 'none',
        fontSize: theme.typography.pxToRem(12),
        fontFamily: 'Synthese-Regular !important',
    },
}));


// ----------------------------------------------------------------------
export default function RecentReportsListTable(props:any) {
    const { themeStretch } = useSettings();
    const {isLoading = false} = props;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [isLoading, setIsLoading] = useState<boolean>(false);

    const [filterName, setFilterName] = useState('');
    const [getFilters, setGetFilters] = useState({});
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [limit, setLimit] = useState(25);
    const [open, setOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [rowId, setRowId] = useState("");
    const [reportsDataList, setReportsDataList] = useState([]);
    const [metaData, setMetaData] = useState({});
    const [fromDate, setFromDate] = useState("2022-12-12");
    const [toDate, setToDate] = useState("2022-12-20");
    const [reportDetails, setReportDetails] = useState({});


    const handleFilter = (value: any) => {
        setGetFilters(value);
    }

    const handleFilterApplied = () => {
        setIsFilterApplied(true);
    }

    const [pageCount, setPageCount] = useState(1);
    const [clear, setClear] = useState<any>(false);
    const handleFilterName = (filterName: string) => {
        setFilterName(filterName);
        setPage(0);
    };

    let newState = {
        page: page,
        limit: limit,
    };

    //   const data = useFarmsQuery(isFilterApplied ? getFilters : newState);   
    //     const ReportsList = data?.data?.data ? data?.data?.data : [];

    // const getRecentAllReports = async (order: any, page: any, limit: any, fromDate: any, toData: any) => {
    //     setIsLoading(true)
    //     try {
    //         await getRecentReportList(order, page, limit, fromDate, toData).then((res: any) => {
    //             if (res) {
    //                 setIsLoading(false)
    //                 if (res?.data) {
    //                     setReportsDataList(res.data)
    //                 }
    //                 if (res?.meta) {
    //                     setMetaData(res?.meta)
    //                     setPageCount(res?.meta?.pageCount)
    //                 }
    //             }
    //         })
    //     } catch (error) {
    //         console.error(error);
    //         setIsLoading(false)
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    useEffect(() => {
        // getRecentAllReports("DESC", page, limit, fromDate, toDate)
        if(props?.datalist?.length){
            setReportsDataList(props?.datalist)
        }
    }, [props?.datalist])

    const ReportsListProps = {
        page: (page == 0) ? 1 : page,
        setPage,
        result: reportsDataList,
        pagination: metaData,
        query: {},
        clear,
        setClear,
        limit: rowsPerPage,
        setLimit
    };

    //   useEffect(() => {
    //     setTableData(data?.data || tableData)
    //   }, [data])

    const [editId, setEditId] = useState('');
    const [openAddEditForm, setOpenAddEditForm] = useState(false);
    const handleDrawerOpenRow = (stallionId: string) => {
        setOpenAddEditForm(true);
    };

    const handleDrawerCloseRow = () => {
        setOpenAddEditForm(false);
    };

    const handleEditPopup = async (data:any) => {
        setReportDetails(data)
        setOpen(!open);
        await getReportOrderbyId(data.orderId)
    }

    const handleEditState = () => {
        setEdit(true);
    }

    const handleCloseEditState = () => {
        setEdit(!isEdit);
    }

    const [selected, setSelected] = useState([]);
    const [openPopper, setOpenPopper] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
        setOpenPopper((previousOpen) => !previousOpen);
    };

    const canBeOpen = openPopper && Boolean(anchorEl);
    const id = canBeOpen ? 'transition-popper' : undefined;

    const hidePopover = () => {
        setOpenPopper(false);
    }

    const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenuActions(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setOpenMenuActions(null);
    };

    return (
        <StyledEngineProvider injectFirst>
            <Page title="Recent Reports List" sx={{ display: 'flex' }} className='ReportListTable'>
                <Container maxWidth={themeStretch ? false : 'lg'} className='datalist' style={{padding: "0"}} >
                    {isLoading ?
                        <Box className='Spinner-Wrp'>  <Spinner /></Box> :
                        (ReportsListProps?.result?.length > 1) ?
                            <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                                <Scrollbar>
                                    <TableContainer className='datalist' sx={{ minWidth: 800 }} ref={ref}>
                                        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                                            <TableHead className='reportsTableHead'>
                                                <TableRow>
                                                    <TableCell align="left">Order ID</TableCell>
                                                    <TableCell align="left">Date</TableCell>
                                                    <TableCell align="left">Client Name</TableCell>
                                                    <TableCell align="left">Email</TableCell>
                                                    <TableCell align="left">Report</TableCell>
                                                    <TableCell align="left">Country</TableCell>
                                                    <TableCell align="left">Paid</TableCell>
                                                    <TableCell align="left">Status</TableCell>
                                                    <TableCell align="left">PDF</TableCell>
                                                    <TableCell align="left" className='icon-share-wrapper'><i className={'icon-Share'} /></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {reportsDataList.map((row: any, index: number) => (
                                                    <ReportsListTableRow
                                                        key={row.farmId}
                                                        row={row}
                                                        selected={row.farmId}
                                                        onSelectRow={row.farmId}
                                                        onEditPopup={() => handleEditPopup(row)}
                                                        onSetRowId={() => setRowId(row.farmId)}
                                                        handleEditState={() => handleEditState()}
                                                    />
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Scrollbar>

                                <Box className='Pagination-wrapper'>
                                    <PaginationSettings data={ReportsListProps} />
                                    <PaginationLimit data={ReportsListProps} />
                                </Box>
                            </Card>
                            :
                            <NoDataComponent hideText="no data" />
                    }
                </Container>
                <ViewDetailsModal open={open} rowId={rowId} dataDetails={reportDetails} isEdit={isEdit} handleEditPopup={() => setOpen(false)} handleCloseEditState={handleCloseEditState} />
            </Page>
        </StyledEngineProvider>
    );
}


type RowProps = {
    row: any;
    selected: boolean;
    onSelectRow: VoidFunction;
    onEditPopup: VoidFunction;
    onSetRowId: VoidFunction;
    handleEditState: VoidFunction;
};

function ReportsListTableRow({
    row,
    selected,
    onSelectRow,
    onEditPopup,
    onSetRowId,
    handleEditState
}: RowProps) {
    const theme = useTheme();

    const {
        orderId,
        clientName,
        countryName,
        email, countryCode,
        productName,
        currencySymbol,
        orderCreatedOn,
        isImported,
        subTotal,
        total,
        paymentStatus,
    } = row;

    const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenuActions(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setOpenMenuActions(null);
    };

    function parseDate(dateToParse: string) {

        let parsedDate = new Date(dateToParse)
        const formattedDate = `${parsedDate.getDate().toString().padStart(2, "0")}.${(parsedDate.getMonth() + 1).toString().padStart(2, "0")}.${parsedDate.getFullYear()}`
        return formattedDate;
    }

    let ImportediconClass = (isImported == true) ? 'icon-Confirmed-24px' : 'icon-NonPromoted';

    return (
        <StyledEngineProvider injectFirst>
            <TableRow hover selected={selected} >
                <TableCell align="left">{orderId}</TableCell>
                <TableCell align="left">{parseDate(orderCreatedOn)}</TableCell>
                <TableCell align="left">{clientName}</TableCell>
                <TableCell align="left">{email}</TableCell>
                <TableCell align="left">
                    <HtmlTooltip
                        placement="bottom"
                        className="tableTooltip tablist-tooltip"
                        title={
                            <React.Fragment>
                                <Box className='tooltipPopoverBody'>
                                    <p>La Lova (2016, AUS)</p>
                                </Box>
                            </React.Fragment>
                        }
                    >
                        <i className='emailNote'><u>{productName}</u></i>
                    </HtmlTooltip>
                </TableCell>
                <TableCell align="left">{countryName}</TableCell>
                <TableCell align="left">
                    <HtmlTooltip
                        placement="bottom"
                        className="tableTooltip tablist-tooltip reportlist-tooltip"
                        title={
                            <React.Fragment>
                                <Box className='tooltipPopoverBody'>
                                    <p>Subtotal: {`${countryCode}${currencySymbol}${subTotal}`} <br />
                                        Discount: - US$0 <br />
                                        Total: {`US${currencySymbol}${total}`} <br />
                                        Gateway: PayPal</p>
                                </Box>
                            </React.Fragment>
                        }
                    >
                        <i className='emailNote'><u>{`US${currencySymbol}${subTotal}`}</u></i>
                    </HtmlTooltip>
                </TableCell>
                <TableCell align="center">
                    <HtmlTooltip
                        placement="bottom"
                        className="tableTooltip tablist-tooltip reportlist-tooltip"
                        title={
                            <React.Fragment>
                                <Box className='tooltipPopoverBody'>
                                    <p>Ordered: 22.02.2021 3.51pm    <br />
                                        Initiated: 22.02.2021 3.51pm  <br />
                                        Completed: 22.02.2021 4.02pm  <br />
                                        Delivered: 22.02.2021 4.03pm
                                    </p>
                                </Box>
                            </React.Fragment>
                        }
                    >
                        <i className='emailNote'><u>{paymentStatus}</u></i>
                    </HtmlTooltip>
                </TableCell>
                <TableCell align="left">
                <ReactToPdf targetRef={ref}  filename="reports-dashboard.pdf">
                    {/* @ts-ignore */}
                    {({ toPdf }) => <Stack className='icon-link-box' onClick={toPdf}>
                        <i className='icon-Link-green'></i>
                    </Stack>
                    // <Button type='button' className='ShareBtn' ><i className='icon-Share'></i></Button>
                    }
                  </ReactToPdf>
                    
                </TableCell>
                <TableCell align="right">
                    <TableMoreMenu
                        open={openMenu}
                        onOpen={handleOpenMenu}
                        onClose={handleCloseMenu}
                        actions={
                            <>
                                <MenuItem
                                    onClick={() => {
                                        onEditPopup();
                                        onSetRowId();
                                        handleCloseMenu();
                                        handleEditState();
                                    }}
                                >
                                    View Details
                                </MenuItem>
                                <Divider style={{ margin: "0" }} />
                                <MenuItem
                                >
                                    Resend Report
                                </MenuItem>
                                <Divider style={{ margin: "0" }} />
                                <MenuItem
                                >
                                    Activate Link
                                </MenuItem>
                                <Divider style={{ margin: "0" }} />
                                <MenuItem
                                >
                                    Deactivate Link
                                </MenuItem>
                            </>
                        }
                    />
                </TableCell>
            </TableRow>
        </StyledEngineProvider>
    );
}


