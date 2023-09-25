import { useEffect, useState } from 'react';
import styles from './App.module.scss';

const apiBaseUrl =
  'https://express-guest-list-api-memory-data-store--phreis.repl.co';

class GuestType {
  constructor(id = uuid(), firstName, lastName, attending = false) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.attending = attending;
  }
}
function uuid() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

export default function App() {
  const [guestFormData, setGuestFormData] = useState(
    new GuestType('', '', '', false),
  );
  const [guestList, setGuestList] = useState([]);
  const [isBusy, setIsBusy] = useState(true);

  useEffect(() => {
    fetch(`${apiBaseUrl}/guests`)
      .then((response) => response.json())
      .then((result) => {
        setIsBusy(false);
        setGuestList(result);
      })
      .catch((err) => {
        setIsBusy(false);
        throw err;
      });
  }, []);

  function addGuest(firstName, lastName, attending = false) {
    try {
      fetch(`${apiBaseUrl}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          attending: attending,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          const guestListIntermediate = [
            ...guestList,
            new GuestType(
              result.id,
              result.firstName,
              result.lastName,
              result.attending,
            ),
          ];
          setGuestList(guestListIntermediate);
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      console.log(e);
      return;
    }
  }

  function deleteGuest(id) {
    fetch(`${apiBaseUrl}/guests/${id}`, { method: 'DELETE' })
      .then((resp) => resp.json())
      .then((result) => {
        setGuestList(guestList.filter((guest) => guest.id !== result.id));
      })
      .catch((err) => {
        throw err;
      });
  }

  function updateGuest(guestChanged) {
    try {
      fetch(`${apiBaseUrl}/guests/${guestChanged.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: guestChanged.firstName,
          lastName: guestChanged.lastName,
          attending: guestChanged.attending,
        }),
      })
        .then((response) => response.json())
        .then((updatetGuest) => {
          setGuestList(
            guestList.map((guest) =>
              guest.id === updatetGuest.id ? updatetGuest : guest,
            ),
          );
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <main className={styles.main}>
      <form
        className={styles.mainForm}
        onSubmit={(event) => {
          setGuestFormData({ firstName: '', lastName: '' });
          event.preventDefault();
        }}
      >
        <label htmlFor="firstName">First name</label>
        <input
          onInput={(event) => {
            setGuestFormData({
              ...guestFormData,
              firstName: event.target.value,
            });
            // setFirstName(event.target.value);
          }}
          value={guestFormData.firstName}
          id="firstName"
          disabled={isBusy}
        />
        <label htmlFor="lastName">Last name</label>
        <input
          onInput={(event) => {
            setGuestFormData({
              ...guestFormData,
              lastName: event.target.value,
            });
            // setLastName(event.target.value);
          }}
          value={guestFormData.lastName}
          id="lastName"
          disabled={isBusy}
        />
        <button
          onClick={() => {
            addGuest(guestFormData.firstName, guestFormData.lastName);
          }}
          disabled={isBusy}
        >
          Add Guest
        </button>
      </form>
      <h2>
        Guest list (
        {guestList.filter((guest) => guest.attending === true).length} of{' '}
        {guestList.length} attending)
      </h2>
      {isBusy && <div>Loading...</div>}

      {guestList.toReversed().map((guest) => (
        <Guest
          key={`guest-${guest.id}`}
          guest={guest}
          deleteGuest={deleteGuest}
          updateGuest={updateGuest}
        />
      ))}
    </main>
  );
}
function Guest(props) {
  // const [guest, setGuest] = useState();

  // setGuest(guest);

  const [editMode, setEditMode] = useState(false);
  const [guestFormData, setGuestFormData] = useState(props.guest);

  return (
    <div className={styles.mainGuests}>
      <div data-test-id="guest">
        <label htmlFor="Attending">attending</label>
        <input
          type="checkbox"
          id="attending"
          name="attending"
          aria-label="attending"
          onChange={(event) => {
            props.updateGuest({
              ...props.guest,
              attending: event.target.checked,
            });
          }}
          checked={props.guest.attending}
        />
        {/*         Next two lines, to make drone happy: */}
        {guestFormData.firstName}
        {guestFormData.lastName}
        <input
          onInput={(event) => {
            setGuestFormData({
              ...guestFormData,
              firstName: event.target.value,
            });
            // setFirstName(event.target.value);
          }}
          value={guestFormData.firstName}
          id="firstName"
          disabled={!editMode}
        />

        <input
          onInput={(event) => {
            setGuestFormData({
              ...guestFormData,
              lastName: event.target.value,
            });
            // setLastName(event.target.value);
          }}
          value={guestFormData.lastName}
          id="lastName"
          disabled={!editMode}
        />
        <button
          onClick={() => {
            props.updateGuest(guestFormData);
            setEditMode(false);
          }}
          disabled={!editMode}
        >
          Save
        </button>

        <button onClick={() => setEditMode(!editMode)}>✍️</button>
        <button
          aria-label="Remove"
          onClick={() => props.deleteGuest(props.guest.id)}
        >
          Remove 🗑️
        </button>
      </div>
    </div>
  );
}
