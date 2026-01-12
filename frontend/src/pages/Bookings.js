import React, { useState, useRef, useEffect, useContext } from "react";

import Spinner from "../components/Spinner/Spinner";
import AuthContext from "../context/auth-context";
import BookingList from "../components/Bookings/BookingList/BookingList";
import BookingsChart from "../components/Bookings/BookingsChart/BookingsChart";
import BookingsControls from "../components/Bookings/BookingsControls/BookingsControls";
import API_URL from "../helpers/react-app-url";

function BookingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [outputType, setOutputType] = useState("list");

  const authContext = useContext(AuthContext);
  const didFetchRef = useRef(false);

  useEffect(() => {
     if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchBookings();
    //eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    const requestBody = {
      query: `
          query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
               price
             }
            }
          }
        `,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authContext.token,
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed!");
      }
      const resData = await res.json();
      const fetchedBookings = resData.data.bookings;
      setBookings(fetchedBookings);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const deleteBookingHandler = async (bookingId) => {
    setIsLoading(true);
    const requestBody = {
      query: `
          mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
            _id
             title
            }
          }
        `,
      variables: {
        id: bookingId,
      },
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authContext.token,
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed!");
      }
      await res.json();
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const changeOutputTypeHandler = (type) => {
    setOutputType(type === "list" ? "list" : "chart");
  };

  let content = <Spinner />;
  if (!isLoading) {
    content = (
      <React.Fragment>
        <BookingsControls
          activeOutputType={outputType}
          onChange={changeOutputTypeHandler}
        />
        <div>
          {outputType === "list" ? (
            <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
          ) : (
            <BookingsChart bookings={bookings} />
          )}
        </div>
      </React.Fragment>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}

export default BookingsPage;
