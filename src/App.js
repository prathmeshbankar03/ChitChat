import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import 'firebase/compat/auth'; 


import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

import { newBadWords } from './bad-word';


firebase.initializeApp({
  //Your Firebase Configurations
})

const auth = firebase.auth()
const firestore = firebase.firestore()

const Filter = require('bad-words');
const filter = new Filter();


filter.addWords(...newBadWords);

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <div className='logo-name'>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256"><g fill="currentColor"><path d="M224 96v128l-39.58-32H88a8 8 0 0 1-8-8v-40h88a8 8 0 0 0 8-8V88h40a8 8 0 0 1 8 8Z" opacity=".2"/><path d="M216 80h-32V48a16 16 0 0 0-16-16H40a16 16 0 0 0-16 16v128a8 8 0 0 0 13 6.22L72 154v30a16 16 0 0 0 16 16h93.59L219 230.22a8 8 0 0 0 5 1.78a8 8 0 0 0 8-8V96a16 16 0 0 0-16-16ZM66.55 137.78L40 159.25V48h128v88H71.58a8 8 0 0 0-5.03 1.78ZM216 207.25l-26.55-21.47a8 8 0 0 0-5-1.78H88v-32h80a16 16 0 0 0 16-16V96h32Z"/></g></svg>
        <p>ChitChat</p>
        </div>
        <Profile/>
      </header>

      <section>
        {user ? <Chatroom/> : <SignIn/>}
      </section>

    </div>
  );
}

const placeholder = () => {
  const list = ["Share Something Amusing 😄",
  "Share Something New 😎",
  "Share Something Interesting ☕",
  "Got Something to Tell ? 💬",
  "Wanna Share Something ? ✌️",
  "Say Something Nice 😊",
  "Share Something inspiring 💪",
  "Say Something humorous 😆",
  "Share a Story 💖",
  "Share a Joke 🤣"
]

  return list[Math.floor(Math.random()*10)]
}

const SignIn = () => {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return(
    <>
      <div className='signInWithGoogle'>
        <button type="button" class="login-with-google-btn" onClick={signInWithGoogle} >Sign in with Google</button>
      </div>
      <div className='rules'>
        <ol className='rules-items'>
          <li>As a user of a chat app, there are some rules and regulations that you should follow to ensure your safety and the safety of others. Here are some common ones:</li>
          <li>1. Respect Others: It's important to respect other users of the chat app, their beliefs, opinions, and feelings. Avoid using language or behavior that is discriminatory, offensive, or hurtful.</li>
          <li>2. Protect your personal information: Never share personal information, such as your full name, phone number, address, or credit card information with anyone on the chat app. Also, avoid clicking on links or downloading files from unknown sources.</li>
          <li>3. Report inappropriate behavior: If you encounter any inappropriate behavior, such as cyberbullying or harassment, report it immediately to the chat app's moderators or administrators.</li>
          <li>Remember that online interactions can have real-world consequences, so always use the chat app responsibly and with respect for others.</li>
        </ol>

        <span className='happy-chatting'>Happy Chatting 😊 !!!</span>

      </div>
    </>
  )



}
function Profile() {
  return auth.currentUser && (
    <>
    <div className='profile-section'>
      <div>
        <img alt='PFP' src={auth.currentUser.photoURL} ></img>
      </div>
      <div className='name-signout'>
        <p className='display-name'>{auth.currentUser.displayName}</p>
        <button className='signout-btn' onClick={() => auth.signOut()}>Sign Out</button>
      </div>
    </div>
    </>
  )
}


const Chatroom = () => {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast('50');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  

  const cleaned = () => {
    if (filter.isProfane(formValue)) {
      var clean = filter.clean(formValue);
      return clean
    }
    else{
      return formValue
    }
  }
  
  const sendMessage = async (e) => {
    e.preventDefault();

    

    const { uid, photoURL } = auth.currentUser;

    

    await messagesRef.add({
      text: cleaned(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    // dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  return(
    <>
    <main>
      <div>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder={placeholder()} />
        <button type="submit" disabled={!formValue}>📨</button>
      </form>
    </>
  )



}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>    
    <div className={`message ${messageClass}`}>
      <img alt='profile' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}




export default App;
