import { useState, useRef, useContext } from "react";

import "./Auth.css";
import AuthContext from "../context/auth-context";
import API_URL from "../helpers/react-app-url";
import Spinner from "../components/Spinner/Spinner";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
   const [isLoading, setIsLoading] = useState(false);
    const [infoMessage, setInfoMessage] = useState(""); 
  const authContext = useContext(AuthContext);

  const emailEl = useRef();
  const passwordEl = useRef();

  const switchModeHandler = () => {
    setIsLogin((prev) => !prev);
     setInfoMessage(""); // clear any previous message when switching modes
    // submitHandler(event)
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const email = emailEl.current.value;
    const password = passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

     setIsLoading(true);
     setInfoMessage(""); // clear message on new submit

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password,
      },
    };

    if (!isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password,
        },
      };
    }

    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
          // login successful
        if (resData.data && resData.data.login && resData.data.login.token) {
          authContext.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
            return;
        }

        // user created (signup) - show info message
        if (resData.data && resData.data.createUser) {
          setInfoMessage("User created successfully. You can now log in.");
          setIsLogin(true); // switch to login mode
          // auto-clear message after 2s
          setTimeout(() => setInfoMessage(""), 2000);
        }
      })
      .catch((err) => {
        /* eslint-disable no-console */
        console.log(err);
        if(isLogin) {
           setInfoMessage("User does not exist or incorrect credentials.");
        }
        console.log("Authentication failed!", err);
        /* eslint-enable no-console */
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form className="auth-form" onSubmit={submitHandler}>
      <div className="form-control">
        <label htmlFor="email">E-Mail</label>
        <input type="email" id="email" ref={emailEl} />
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" ref={passwordEl} />
      </div>
      <div className="form-actions">
        <button type="submit">Submit</button>
        <button type="button" onClick={switchModeHandler}>
          Switch to {isLogin ? "Signup" : "Login"}
        </button>

         {isLoading &&  <Spinner />}

         {/* info message shown after successful signup */}
      {infoMessage && <p className="info-message">{infoMessage}</p>}
      </div>
    </form>
  );
}

export default AuthPage;
