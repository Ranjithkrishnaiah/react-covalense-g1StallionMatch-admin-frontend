import React from 'react';
import { useState } from 'react';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// @mui
import {
    Box,
    TableCell,
    TableRow,
    StyledEngineProvider,
    MenuItem,
    Divider,
    styled,
    Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// components
import { TableMoreMenu } from 'src/components/table';
import 'src/sections/@dashboard/css/list.css';
// ----------------------------------------------------------------------
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import ReactToPdf from "react-to-pdf";
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { api } from 'src/api/apiPaths';
import { Images } from 'src/assets/images';
import { toPascalCase } from 'src/utils/customFunctions';
import { getReportOrderbyId, postBoodMareAfinityReport, postBoodMareSireReport, postSalesCatelogueReport, postShortlistStallionReport, postStallionAfinityReport, postStallionMatchProReport } from 'src/redux/splitEndpoints/reportServicesSplit';

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

type RowProps = {
    row: any;
    selected: boolean;
    onSelectRow: VoidFunction;
    onEditPopup: VoidFunction;
    onSetRowId: VoidFunction;
    handleEditState: VoidFunction;
    refreshState: VoidFunction;
    apiStatus?: boolean;
    setApiStatus?: React.Dispatch<React.SetStateAction<boolean>>;
    apiStatusMsg?: any;
    setApiStatusMsg?: React.Dispatch<React.SetStateAction<any>>;
    reportModuleAccess?: any;
    setReportModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
    clickedPopover?: any;
    setClickedPopover: React.Dispatch<React.SetStateAction<any>>;
};

function ReportsDataTableRow({
    row,
    selected,
    onSelectRow,
    onEditPopup,
    onSetRowId,
    handleEditState,
    refreshState,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg,
    reportModuleAccess, setReportModuleAccess,
    clickedPopover, setClickedPopover
}: RowProps) {
    useSnackbar();

    const theme = useTheme();
    const { data: countriesList } = useCountriesQuery();

    const {
        orderId,
        clientName,
        email, countryCode,
        productName,
        currencySymbol,
        orderCreatedOn,
        isImported,
        subTotal,
        total,
        orderProductId,
        isLinkActive,
        reportLink,
        noOfStallions,
        horseName,
        horseCob,
        horseYob,
        sales,
        currencyCode,
        discount,
        paymentStatus,
        paymentMethod
    } = row;

    const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
    const [editDataDetails, setEditDataDetails] = useState({});
    //opens Menu
    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenuActions(event.currentTarget);
    };
    // closes the Menu
    const handleCloseMenu = () => {
        setOpenMenuActions(null);
    };
    //Retruns Country name value
    const countryNamevalue = (countryCode: any) => {
        const countryData: any = countriesList?.length ? countriesList?.find((item: any) => item?.countryCode === countryCode) : "";
        return countryData?.countryName;
    }
    //Saves Order
    const handleSaveOrder = async () => {
        if (!reportModuleAccess?.report_resend_report) {
            setClickedPopover(true);
        } else {
            handleCloseMenu()
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(api.baseUrl + `/report/send-report/${orderProductId}`, {
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'application/json'
                    }
                })
                if (response) {
                    if (setApiStatusMsg) setApiStatusMsg({ 'status': 201, 'message': 'Order Report Re sent!' });
                    if (setApiStatus) setApiStatus(true);
                    return
                }

                if (setApiStatusMsg) setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs resending order report' });
                if (setApiStatus) setApiStatus(true);

            } catch (error) {
                if (setApiStatusMsg) setApiStatusMsg({ 'status': 422, 'message': 'Some error occurs resending order report' });
                if (setApiStatus) setApiStatus(true);
                return
            }
        }
    }

    const handleLinkChange = async (type: number) => {
        if (!reportModuleAccess?.report_activate_link) {
            setClickedPopover(true);
        } else {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get(api.baseUrl + `/orders/activate-deactivate-link/${orderProductId}/${type}`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            })
            if (response) {
                if (setApiStatusMsg) setApiStatusMsg({ 'status': 201, 'message': type === 1 ? 'Link activated!' : 'Link deactivated!' });
                if (setApiStatus) setApiStatus(true);
                refreshState()
                return
            }
        }
    }

    let showOnHoverReportTooltip = () => {
        let text = '';
        if (productName === "Shortlist Stallion Report" || productName === "Stallion Match PRO Report") {
            text = `${noOfStallions} ${noOfStallions > 1 ? 'Stallions' : 'Stallion'}`;
        }
        if (productName === "Stallion Affinity Report"
            || productName === "Broodmare Sire Report"
            || productName === "Broodmare Affinity Report") {
            if (horseName) {
                text = `${horseName} (${horseYob}, ${horseCob})`;
            } else {
                text = `No horse found`;
            }
        }
        if (productName === "Stallion Match Sales Report" || productName === "Stallion X Breeding Stock Sale") {
            let salesData = sales;
            if (salesData?.length) {
                text = `${salesData?.[0]?.saleYear} ${salesData?.[0]?.salesName}`;
            } else {
                text = `No data found`
            }
        }
        return text;
    }

    const getRenerateAndRefreshReportData = async (type: string) => {
        const reportData = await getReportOrderbyId(orderProductId);
        try {
            if (reportData) {
                setEditDataDetails(reportData);
                handleRegenerateAndRefresh(reportData, type);
            }
        } catch (error) {
            if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
            if (setApiStatus) setApiStatus(true);
        }
    }

    const handleRegenerateAndRefresh = async (data: any, type: string) => {
        const { orderProductId: orderId, productId, stallions, horseUuid, countryId, currencyId, lotId, sales, stallionId, farms } = data;
        let payloadData: any = {};

        if (productId === 1) {
            payloadData = {
                actionType: type,
                stallions: stallions.map((val: any) => val.stallionId),
                mareId: horseUuid,
                orderProductId: orderId,
            };
            await postShortlistStallionReport(payloadData)
                .then((res: any) => {
                    if (res?.status === 500) {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                        if (setApiStatus) setApiStatus(true);
                    } else {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 201, message: `${type} successfully!` });
                        if (setApiStatus) setApiStatus(true);
                    }
                })
                .catch((error: any) => {
                    if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                    if (setApiStatus) setApiStatus(true);
                });
        }

        if (productId === 2) {
            payloadData = {
                actionType: type,
                stallions: stallions.map((val: any) => val.stallionId),
                countryId: countryId,
                currencyId: currencyId,
                orderProductId: orderId,
                locations: [countryId],
                mareId: horseUuid
            };
            await postStallionMatchProReport(payloadData).then((res: any) => {
                if (res?.status === 500) {
                    if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                    if (setApiStatus) setApiStatus(true);
                } else {
                    if (setApiStatusMsg) setApiStatusMsg({ status: 201, message: `${type} successfully!` });
                    if (setApiStatus) setApiStatus(true);
                }
            })
                .catch((error: any) => {
                    if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                    if (setApiStatus) setApiStatus(true);
                });
        }

        if (productId === 3 || productId === 6) {
            payloadData = {
                actionType: type,
                locations: [countryId],
                countryId: countryId,
                // stallions: selectedStallion?.map((val: any) => val.stallionId),
                orderProductId: orderId,
                mareId: horseUuid
            };
            if (productId === 6) {
                await postBoodMareSireReport(payloadData)
                    .then((res: any) => {
                        if (res?.status === 500) {
                            if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                            if (setApiStatus) setApiStatus(true);
                        } else {
                            if (setApiStatusMsg) setApiStatusMsg({ status: 201, message: `${type} successfully!` });
                            if (setApiStatus) setApiStatus(true);
                        }
                    })
                    .catch((error: any) => {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                        if (setApiStatus) setApiStatus(true);
                    });
            } else {
                await postBoodMareAfinityReport(payloadData)
                    .then((res: any) => {
                        if (res?.status === 500) {
                            if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                            if (setApiStatus) setApiStatus(true);
                        } else {
                            if (setApiStatusMsg) setApiStatusMsg({ status: 201, message: `${type} successfully!` });
                            if (setApiStatus) setApiStatus(true);
                        }
                    })
                    .catch((error: any) => {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                        if (setApiStatus) setApiStatus(true);
                    });
            }
        }

        if (productId === 4) {
            payloadData = {
                // name: field.name,
                // email: field.email,
                actionType: type,
                currencyId: currencyId,
                countryId: countryId,
                sales: [...sales.map((val: any) => val.id)],
                lots: [...lotId],
                orderProductId: orderId,
            };
            await postSalesCatelogueReport(payloadData)
                .then((res: any) => {
                    if (res?.status === 500) {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                        if (setApiStatus) setApiStatus(true);
                    } else {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 201, message: `${type} successfully!` });
                        if (setApiStatus) setApiStatus(true);
                    }
                })
                .catch((error: any) => {
                    if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                    if (setApiStatus) setApiStatus(true);
                });
        }

        if (productId === 5) {
            payloadData = {
                actionType: type,
                countryId: countryId,
                stallionId: stallionId,
                farms: farms.length ? farms?.map((v: any) => v?.farmUuid) : [],
                orderProductId: orderProductId,
            };
            await postStallionAfinityReport(payloadData)
                .then((res: any) => {
                    if (res?.status === 500) {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                        if (setApiStatus) setApiStatus(true);
                    } else {
                        if (setApiStatusMsg) setApiStatusMsg({ status: 201, message: `${type} successfully!` });
                        if (setApiStatus) setApiStatus(true);
                    }
                })
                .catch((error: any) => {
                    if (setApiStatusMsg) setApiStatusMsg({ status: 422, message: 'Some error occurs' });
                    if (setApiStatus) setApiStatus(true);
                });
        }

    };

    return (
        <StyledEngineProvider injectFirst>
            <TableRow hover selected={selected} >
                {/* Order Id cell  */}
                <TableCell align="left">
                    <i className='emailNote'
                        onClick={() => {
                            onEditPopup();
                            onSetRowId();
                            handleCloseMenu();
                            handleEditState();
                        }}><u>{orderId}</u>
                    </i>
                </TableCell>
                {/* Date cell  */}
                <TableCell align="left">{parseDateAsDotFormat(orderCreatedOn)}</TableCell>
                {/* Client Name cell */}
                <TableCell align="left">{clientName ? clientName : '--'}</TableCell>
                {/* Email cell  */}
                <TableCell align="left">{email ? email : '--'}</TableCell>
                {/* Reports Cell  */}
                <TableCell align="left">
                    <HtmlTooltip
                        placement="bottom"
                        className="tableTooltip tablist-tooltip"
                        title={
                            <React.Fragment>
                                <Box className='tooltipPopoverBody'>
                                    <p>{toPascalCase(showOnHoverReportTooltip())}</p>
                                </Box>
                            </React.Fragment>
                        }
                        disableHoverListener={(productName === 'Promoted Stallion' || productName === 'Local Boost' || productName === 'Extended Boost' || productName === 'Nomination Acceptance')
                            ? true : false}
                    >
                        <i className='emailNote'><u>{productName}</u></i>
                    </HtmlTooltip>
                </TableCell>
                {/* country cell  */}
                <TableCell align="left">{countryNamevalue(countryCode)}</TableCell>
                {/* Paid cell  */}
                <TableCell align="left">
                    <HtmlTooltip
                        placement="bottom"
                        className="tableTooltip tablist-tooltip reportlist-tooltip"
                        title={
                            <React.Fragment>
                                <Box className='tooltipPopoverBody'>
                                    <p>Subtotal: {`${currencyCode?.substring(0, 2)}${currencySymbol}${subTotal}`} <br />
                                        Discount: {`${currencyCode?.substring(0, 2)}${currencySymbol}${discount}`} <br />
                                        Total: {`${currencyCode?.substring(0, 2)}${currencySymbol}${total}`} <br />
                                        Gateway: {paymentMethod ? paymentMethod : '--'}</p>
                                </Box>
                            </React.Fragment>
                        }
                    >
                        <i className='emailNote'><u>{`${currencyCode?.substring(0, 2)}${currencySymbol}${subTotal}`}</u></i>
                    </HtmlTooltip>
                </TableCell>
                {/* Status Cell  */}
                <TableCell align="center">
                    {
                        row.statuses.length ?
                            <HtmlTooltip
                                placement="bottom"
                                className="tableTooltip tablist-tooltip reportlist-tooltip"
                                title={
                                    <React.Fragment>
                                        <Box className='tooltipPopoverBody'>
                                            {
                                                row.statuses.map((val: any, index: number) => {
                                                    return (
                                                        <p key={index}>{val?.status}: {dayjs(val.statusTime).format('DD.MM.YYYY hh:mm a')} <br /></p>
                                                    )
                                                })
                                            }
                                        </Box>
                                    </React.Fragment>
                                }
                            >
                                <i className='emailNote'><u>{row.statuses.at(-1).status}</u></i>
                            </HtmlTooltip>
                            : ""
                    }
                </TableCell>
                {/* Pdf cell  */}
                <TableCell align="left">
                    {isLinkActive ? <a href={reportLink} target='_blank' download> <i style={{ cursor: 'pointer' }}
                        className='icon-Link-green'></i></a> :
                        <span style={{ height: 20, width: 30 }} className='link-green link-disable'><i className='icon-Link-green'></i></span>}

                </TableCell>
                {/* Meat Ball Menu  */}
                <TableCell align="right">
                    <TableMoreMenu
                        open={openMenu}
                        onOpen={handleOpenMenu}
                        onClose={handleCloseMenu}
                        actions={
                            <>
                                {/* ViewDetail option  */}
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
                                {/* Resend Option Report  */}
                                <MenuItem
                                    onClick={() => {
                                        handleSaveOrder()
                                    }}
                                    disabled={reportLink ? false : true}
                                >
                                    Resend Report
                                </MenuItem>
                                <Divider style={{ margin: "0" }} />
                                {/* Deactivate Link option  */}
                                {!isLinkActive &&
                                    <>
                                        <MenuItem onClick={() => handleLinkChange(1)}
                                            disabled={reportModuleAccess?.activate_report === true ? false : true}
                                        >
                                            Activate Link
                                        </MenuItem>

                                    </>
                                }
                                {isLinkActive && <MenuItem
                                    onClick={() => handleLinkChange(0)}
                                    disabled={reportModuleAccess?.activate_report === true ? false : true}
                                >
                                    Deactivate Link
                                </MenuItem>}
                                <Divider style={{ margin: "0" }} />
                                {/* Regenerate Option Report  */}
                                <MenuItem
                                    onClick={() => {
                                        getRenerateAndRefreshReportData('Regenerate')
                                    }}
                                    // disabled={ true}
                                    disabled={reportLink ? false : true}
                                >
                                    Regenerate Report
                                </MenuItem>
                                <Divider style={{ margin: "0" }} />
                                <MenuItem
                                    onClick={() => {
                                        getRenerateAndRefreshReportData('Refresh')
                                    }}
                                // disabled={true}
                                >
                                    Refresh Report
                                </MenuItem>

                            </>
                        }
                    />
                </TableCell>
            </TableRow>
        </StyledEngineProvider>
    );
}

export default ReportsDataTableRow;
