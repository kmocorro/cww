import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Cookies from 'universal-cookie'
import useSWR from 'swr'
const cookies = new Cookies()

export default function Home() {

  // YES checkbox state
  const [ yes2cww, setYes2cww ] = useState(false)
  const handleOnChangeYes2cww = (e) => {
    setYes2cww(e.target.checked)
    setNo2cww(false)
  }
  // NO checkbox state
  const [ no2cww, setNo2cww ] = useState(false)
  const handleOnChangeNo2cww = (e) => {
    setNo2cww(e.target.checked)
    setYes2cww(false)
  }

  // LOGIN
  const [ token, setToken ] = useState('');
  console.log(token)
  const [ response_login, setResponse_login ] = useState('');
  
  if(token.token){
    cookies.set('token', token.token, {path: '/'});
  } else {
    cookies.set('token', '', {path: '/'});
  }

  const username = useLogin('');
  const password = useLogin('');
  const [ user_profile, setUser_profile ] = useState({employee_number: '', name: ''});

  function useLogin(init){
    const [ value, setValue ] = useState(init);
    const handleOnChange = (e) => {
      setValue(e.target.value);
      setResponse_login('')
    } 
    return {
      value,
      onChange: handleOnChange
    }
  }

  async function handleLogin(){
    let headers = new Headers()
    headers.append('Content-Type', 'application/json')

    if(username.value && password.value){
      let response = await fetch('http://meswebspf409.sunpowercorp.com:8080/api/login', {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({
          username: username.value,
          password: password.value
        })
      })

      if(response.status === 200){
        setToken(await response.json());
      } else if(response.status === 401){
        setResponse_login(await response.json())
      }
    }else {
      setResponse_login({err: 'Username/Password cannot be empty.'})
    }
  }

  const [ submit_response, setSubmit_response ] = useState('')
  const [ disable_cww, setDisable_cww ] = useState(false);

  async function handleSubmitCWW(){
    let headers = new Headers()
    headers.append('Content-Type', 'application/json')

    let response = await fetch('http://meswebspf409.sunpowercorp.com:8080/api/cww', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        employee_number: token.profile.claim.employeeNumber,
        decision: yes2cww ? 'yes' : no2cww ? 'no' : '',
      })
    })

    if(response.status === 200){
      setSubmit_response(await response.json())
      setDisable_cww(true)
    } else if(response.status === 401){
      setSubmit_response(await response.json())
    }
  }


  return (
    <div className="container">
      <Head>
        <title>CWW Volutary Agreement Form | META</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Compressed Work Week (CWW) 
        </h1>

        <p className="description">
          Voluntary Agreement
        </p>
        <div className="sub">
          <p className="sub-description">
          In recognition of the company’s operational needs, I choose and voluntarily agree to work in a compressed work week schedule as follows:
          </p>
          <p className="sub-description">Manufacturing Operations</p>
          <ul>
            <li className="sub-description-list">
              Rolling schedule of
              <ul>
                <li>Four (4) straight days of twelve (12) hours of work</li>
                <li>Two (2) days of rest</li>
              </ul>
            </li>
            <li className="sub-description-list">
              Work in excess of 48 hours in a seven-day work week shall be paid as overtime 
            </li>
          </ul>
        </div>
        <div className="sub">
          <p className="sub-description">
          I understand that management reserves the right to change the work schedule at any time as may be required by business exigencies or if management determines that this work schedule will not be efficient for company operations.
          
          </p>
          <p className="sub-description">
          I understand that, with reasonable notice, I may be required to adjust my work schedule to meet the needs of the department.
          While I choose the compressed schedule, I agree to be bound by the decision of the majority of the relevant employees on the matter.
          </p>
        </div>
        <div className="grid">
          <div className="card">
            <div className="checkboxes">
              <label htmlFor="y">
              <input type="checkbox" id="y" checked={yes2cww} onChange={handleOnChangeYes2cww} disabled={disable_cww}/>
              <h3>Yes to CWW &rarr;</h3>
              </label>
            </div>
            <p>I voluntarily agree to CWW schedule.</p>
          </div>
          <div className="card">
            <div className="checkboxes">
              <label htmlFor="z">
              <input type="checkbox" id="z" checked={no2cww} onChange={handleOnChangeNo2cww} disabled={disable_cww}/>
              <h3>No to CWW &rarr;</h3>
              </label>
            </div>
            <p>Work schedule will be Six (6) working days of eight (8) hours of work (excluding lunch break) per day in a week. One (1) day of rest.</p>
          </div>
        </div>
        {
          yes2cww || no2cww ? (
            !token ? (
              <div className="sub">
                <div>
                  <p className="sub-login">
                    Login to submit your response.
                  </p>
                </div>
                <div className="login">
                  <input type="text" placeholder="username" value={username.value} onChange={username.onChange} />
                  <input type="password" placeholder="password" value={password.value} onChange={password.onChange} />
                  <button className="btn-grad" onClick={handleLogin}>Login</button>
                </div>
                { 
                  !response_login ? (
                    <></>
                  ):(
                    <p className="sub-login-response">
                      {response_login.err}
                    </p>
                  )
                }
              </div>
            ):(
              <></>
            )
          ):(
            <></>
          )
        }
        {
          token ? (
            !submit_response ? (
            <div className="sub">
              <div >
                <p className="sub-login">
                  This is to certify that my decision is final
                </p>
              </div>
              <div className="credentials">
                <p>{token.profile.claim.employeeNumber}</p>
                <p>{token.profile.claim.displayName}</p>
              </div>
              <button className="btn-grad" onClick={handleSubmitCWW}>Submit</button>
            </div>
            ):(
              submit_response.success ? (
                <div className="sub">
                  <p className="success-emoji">🎉</p>
                  <p className="success">
                    Success!
                  </p>
                  <p className="sub-login">
                    Note: Duplicate entries on the same employee number are considered invalid. ⌚✌️
                  </p>
                </div>
              ):(
                submit_response.err ? (
                  <div className="sub">
                    <p className="error-emoji">💔</p>
                    <p className="error">
                      Error. Try ulit.
                    </p>
                    <p className="sub-login">
                      Note: Duplicate entries on the same employee number are considered invalid. ⌚✌️
                    </p>
                  </div>
                ) : (
                  <></>
                )
              )
            )
          ):(
            <></>
          )
        }
      </main>
      <footer>
        <span>META - Manufacturing & Engineering Tool App</span>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer span {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 16px;
          color: gray;
        }


        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          max-width: 760px;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }
        .sub-description {
          line-height: 1.5;
          font-size: 1.25rem;
          opacity: 0.8
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 1200px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 50%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .card-checked {
          margin: 1rem;
          flex-basis: 50%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          color: #0070f3;
          border-color: #0070f3;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
        .sub {
          padding: 0 0.5rem;
          max-width: 780px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .sub-description-list {
          line-height: 1.5;
          font-size: 1.25rem;
          opacity: 0.8;
          padding-bottom: 10px;
        }
        .sub-login-response {
          color: red;
          font-sie: 12px;
        }
        .checkboxes label {
          display: inline-block;
          padding-right: 10px;
          white-space: nowrap;
        }
        .checkboxes input {
          vertical-align: middle;
          margin-right: 14px;
          /* Double-sized Checkboxes */
          -ms-transform: scale(1.5); /* IE */
          -moz-transform: scale(1.5); /* FF */
          -webkit-transform: scale(1.5); /* Safari and Chrome */
          -o-transform: scale(1.5); /* Opera */
          transform: scale(1.5);
          padding: 10px;
        }
        .checkboxes label h3 {
          display:inline;
          vertical-align: middle;
        }
        .login {
          display: flex;
          padding: 24px 10px;
        }
        .login input {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          display:flex;
          margin: 0 1rem 1rem 0;
          flex-basis: 50%;
          padding: 0.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .login input:hover,
        .login input:focus,
        .login input:active {
          color: #303030;
          border-color: #303030;
        }
        .sub-login {
          line-height: 1.5;
          font-size: 1.25rem;
          opacity: 0.8;
        }
        .btn-grad {background-image: linear-gradient(to right, #ff00cc 0%, #333399  51%, #ff00cc  100%)}
        .btn-grad {
          margin-bottom: 18px;
          padding: 15px 45px;
          text-align: center;
          transition: 0.5s;
          background-size: 200% auto;
          color: white;            
          box-shadow: 0 0 20px #eee;
          border-radius: 10px;
          display: block;
        }
        .btn-grad:hover {
          background-position: right center; /* change the direction of the change here */
          color: #fff;
          text-decoration: none;
        }
        .credentials {
          display: inline-block;
          margin-bottom: 20px;
        }
        .credentials p {
          font-size: 1.5rem;
          text-align: center;
          margin: 0 0 0rem 0;
          font-weight: bold;
        }
        .success-emoji {
          font-size: 5rem;
          text-align: center;
          margin: 0 0 0rem 0;
          font-weight: bold;
        }
        .success {
          font-size: 1.5rem;
          text-align: center;
          color: green;
        }
        .error-emoji {
          font-size: 5rem;
          text-align: center;
          margin: 0 0 0rem 0;
          font-weight: bold;
        }
        .error {
          font-size: 1.5rem;
          text-align: center;
          color: red;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
