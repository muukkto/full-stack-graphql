import { useState } from 'react'

import { useMutation, useApolloClient, useSubscription } from '@apollo/client'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/Login'
import Notify from './components/Notify'
import FavoriteBooks from './components/FavoriteBooks'


import { ALL_AUTHORS, ALL_BOOKS, ALL_GENRES, CREATE_BOOK, EDIT_AUTHOR, BOOK_ADDED } from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      notify(`${addedBook.title} added`)

      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })
    }
  })

  const [createBook] = useMutation(CREATE_BOOK, {
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    },
    refetchQueries: [ { query: ALL_BOOKS }, { query: ALL_AUTHORS }, { query: ALL_GENRES } ]})
  
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    },
    refetchQueries: [ { query: ALL_AUTHORS } ]})

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const login = (token) => {
    setToken(token)
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => setPage('favorite')}>recommend</button>
          <button onClick={logout}>logout</button>
          </>
         ) : (  
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Notify errorMessage={errorMessage} />

      <Authors show={page === 'authors'} editAuthor={editAuthor} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} createBook={createBook} />

      <LoginForm show={page === 'login'} setLoginToken={login} setError={notify} />

      <FavoriteBooks show={page === "favorite"} />
    </div>
  )
}

export default App
