import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomToolbar from './CustomToolbar';
import './calender.css';
import { useCurrentMonthSalesQuery } from 'src/redux/splitEndpoints/salesSplit';
const { Calendar, momentLocalizer } = require('react-big-calendar');

const localizer = momentLocalizer(moment);

export default function CalendarSchedularNew() {

    const [currentMonth, setCurrentMonth] = useState<string>(`${new Date().getMonth() + 1}/${new Date().getFullYear()}`);
    const [eventList, setEventList] = useState([]);
    // Api call
    const data = useCurrentMonthSalesQuery('{month}?month=' + currentMonth, { refetchOnMountOrArgChange: true });

    // Fetch api based on month change
    useEffect(() => {
        if (data.currentData && data.isSuccess) {
            createEventList();
        }
    }, [data.isFetching])

    // Add event based on api response
    const createEventList = () => {
        if (data.currentData) {
            let arr: any = [];
            data.currentData.forEach((v: any, i: number) => {
                let obj: any = {};
                obj.start = new Date(v.startDate);
                obj.end = new Date(v.endDate);
                obj.title = (v.salesName);
                obj.id = v.id
                arr.push(obj);
            })
            setEventList(arr);
        }
    }

    // Show calendar navigation and default date
    const { components, defaultDate } = useMemo(() =>
    ({
        components: {
            toolbar: CustomToolbar,
        },
        defaultDate: new Date(),
    }), [])

    const getColourForParticularEvent = (id: number) => {
        let lastDigit = id % 10;
        let bgColor = '';
        if (lastDigit === 0 || lastDigit === 3 || lastDigit === 6 || lastDigit === 9) {
            bgColor = '#2EFFB4';
        }
        if (lastDigit === 1 || lastDigit === 4 || lastDigit === 7) {
            bgColor = '#00DE8E';
        }
        if (lastDigit === 2 || lastDigit === 5 || lastDigit === 8) {
            bgColor = '#007142';
        }
        // console.log(id,lastDigit,bgColor,'bgColor')
        return bgColor;
    }

    // Apply different style on event
    const eventPropGetter = useCallback(
        (event: any, start: Date, end: Date, isSelected: boolean) => ({
            // ...((event.id === 0 || event.id === 3 || event.id === 6 || event.id === 9) && {
            style: {
                backgroundColor: getColourForParticularEvent(event.id),
            },
            // }),
            // ...((event.id === 1 || event.id === 4 || event.id === 7 || event.id === 10) && {
            //     style: {
            //         backgroundColor: '#00DE8E',
            //     },
            // }),
            // ...((event.id === 2 || event.id === 5 || event.id === 8 || event.id === 11) && {
            //     style: {
            //         backgroundColor: '#007142',
            //     },
            // }),
            // ...((event.id >= 12) && {
            //     style: {
            //         backgroundColor: '#2EFFB4',
            //     },
            // }),
            // for refrence
            // ...(event.title.includes('Meeting') && {
            //     className: 'darkGreen',
            // }),
            // ...(event.comp && {
            //     className: 'Completed',
            // }),
        }),
        []
    )

    // Format calendar
    const { formats } = useMemo(
        () => ({
            formats: {
                dateFormat: 'D',
                weekdayFormat: (date: any, culture: any, localizer: any) =>
                    localizer.format(date, 'dd', culture),
            },
        }),
        []
    )

    // for refrence
    const dayPropGetter = useCallback(
        (date) => ({
            ...(moment(date).day() === 2 && {
                className: 'tuesday',
            }),
            ...(moment(date).day() === 4 && {
                style: {
                    backgroundColor: 'darkgreen',
                    color: 'white',
                },
            }),
        }),
        []
    )

    return (
        <div>
            {<Calendar
                localizer={localizer}
                events={eventList}
                startAccessor="start"
                endAccessor="end"
                style={{ minHeight: 400 }}
                onNavigate={(e: any) => {
                    setCurrentMonth(`${new Date(e).getMonth() + 1}/${new Date(e).getFullYear()}`);
                }}
                defaultView="month"
                defaultDate={defaultDate}
                components={components}
                elementProps={
                    { id: "my_scheduler" }
                }
                eventPropGetter={eventPropGetter}
                showAllEvents={true}
                drilldownView={null}
                formats={formats}
            // dayPropGetter={dayPropGetter}
            />}
        </div>
    )
}