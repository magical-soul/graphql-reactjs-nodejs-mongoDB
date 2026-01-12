import React, { useState, useRef, useEffect, useContext } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import EventList from "../components/Events/EventList/EventList";
import Spinner from "../components/Spinner/Spinner";
import AuthContext from "../context/auth-context";
import "./Events.css";
import API_URL from "../helpers/react-app-url";

function EventsPage() {
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const didFetchRef = useRef(false);

  const titleElRef = useRef();
  const priceElRef = useRef();
  const dateElRef = useRef();
  const descriptionElRef = useRef();

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchEvents();
  }, []);

  const startCreateEventHandler = () => {
    setCreating(true);
  };

  const modalCancelHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const modalConfirmHandler = async () => {
    setCreating(false);
    const title = titleElRef.current.value;
    const price = +priceElRef.current.value;
    const date = dateElRef.current.value;
    const description = descriptionElRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const requestBody = {
      query: `
        mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!) {
          createEvent(eventInput: {title: $title, description: $desc, price: $price, date: $date}) {
            _id
            title
            description
            date
            price
          }
        }
      `,
      variables: {
        title,
        desc: description,
        price,
        date,
      },
    };

    const token = authContext.token;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed!");
      }
      const resData = await res.json();
      const created = resData.data.createEvent;
      setEvents((prev) => [
        ...prev,
        {
          _id: created._id,
          title: created.title,
          description: created.description,
          date: created.date,
          price: created.price,
          creator: { _id: authContext.userId },
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            date
            price
            creator {
              _id
              email
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
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed!");
      }
      const resData = await res.json();
      const fetchedEvents = resData.data.events;
      setEvents(fetchedEvents);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const showDetailHandler = (eventId) => {
    const selected = events.find((e) => e._id === eventId);
    setSelectedEvent(selected);
  };

  const bookEventHandler = async () => {
    if (!authContext.token) {
      setSelectedEvent(null);
      return;
    }

    const requestBody = {
      query: `
        mutation BookEvent($id: ID!) {
          bookEvent(eventId: $id) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: selectedEvent._id,
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
      setSelectedEvent(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <React.Fragment>
      {(creating || selectedEvent) && <Backdrop />}
      {creating && (
        <Modal
          title="Add Event"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
          confirmText="Confirm"
        >
          <form>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" ref={titleElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input type="number" id="price" ref={priceElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input type="datetime-local" id="date" ref={dateElRef} />
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea id="description" rows="4" ref={descriptionElRef} />
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        <Modal
          title={selectedEvent.title}
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={bookEventHandler}
          confirmText={authContext.token ? "Book" : "Confirm"}
        >
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{" "}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {authContext.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={authContext.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </React.Fragment>
  );
}

export default EventsPage;
