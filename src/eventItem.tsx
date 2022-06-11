import * as React from 'react';
import "./eventItem.css"

type EventItemProps = {
    data: Output
}
const EventItem = (props: EventItemProps) => {
    const data = props.data;
    return <div className="eventItemContainer">
        <span className="time">
            {data.time.toFixed(3) + " s"}
        </span>
        <span className={"message" + (data.error ? " error": "")}>
            {data.error ? `Type: ${data.message.type}\nMessage: ${data.message.message}` : data.message.message}
        </span>
    </div>
}

export default EventItem;