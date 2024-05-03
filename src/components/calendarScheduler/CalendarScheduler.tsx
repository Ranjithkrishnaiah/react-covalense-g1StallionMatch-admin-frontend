// import { Scheduler } from "@aldabil/react-scheduler";
// import {
//     EventActions,
//     ProcessedEvent,
//     ViewEvent
// } from "@aldabil/react-scheduler/types";
// import { useEffect, useState } from "react";
// import { useCurrentMonthSalesQuery } from "src/redux/splitEndpoints/sales";
// import './calendar-scheduler.css'

export default function CalendarScheduler() {

    // const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    // const [eventList, setEventList] = useState([]);
    // const data = useCurrentMonthSalesQuery(currentMonth);

    // console.log(data, 'data')

    // useEffect(() => {
    //     if (data.currentData && data.isSuccess) {
    //         createEventList();
    //     }
    // }, [data.isFetching])

    // const createEventList = () => {

    // }

    // const handleConfirm = async (
    //     event: ProcessedEvent,
    //     action: EventActions
    // ): Promise<ProcessedEvent> => {
    //     console.log("handleConfirm =", action, event.title);
    //     return new Promise((res, rej) => {
    //         setTimeout(() => {
    //             res({
    //                 ...event,
    //                 event_id: event.event_id || Math.random()
    //             });
    //         }, 3000);
    //     });
    // }

    return (
        // <Scheduler
        //     height={630}
        //     view="month"
        //     editable={false}
        //     draggable={false}
        //     deletable={false}
        //     disableViewNavigator={true}
        //     navigationPickerProps={{
        //         onMonthChange: (month: Date) => {
        //             console.log(month, 'month')
        //             setCurrentMonth(new Date(month).getMonth() + 1);
        //         }
        //     }}
        //     month={
        //         {
        //             weekDays: [0, 1, 2, 3, 4, 5, 6],
        //             weekStartOn: 1,
        //             startHour: 9,
        //             endHour: 17,
        //             navigation: true,
        //             disableGoToDay: false
        //         }
        //     }
        //     events={[
        //         {
        //             event_id: 1,
        //             title: "",
        //             start: new Date("2023/2/2 12:30"),
        //             end: new Date("2023/2/6 10:30"),
        //             color: '#2EFFB4',
        //         },
        //         {
        //             event_id: 2,
        //             title: "",
        //             start: new Date("2023/2/2 10:00"),
        //             end: new Date("2023/2/6 11:00"),
        //             color: '#007142'
        //         },
        //         {
        //             event_id: 3,
        //             title: "",
        //             start: new Date("2023/2/4 10:00"),
        //             end: new Date("2023/2/6 11:00"),
        //             color: '#00DE8E'
        //         },
        //     ]}
        // />
        <>Hi</>
        
    )
}

