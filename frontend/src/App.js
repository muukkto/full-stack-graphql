import { useState } from 'react'

import { gql, useQuery, useMutation } from '@apollo/client'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name
      born
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  query {
    allBooks  {
      title
      author
      published
    }
  }
`

const CREATE_BOOK = gql`
  mutation createBook ($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title
    }
  }
`

const EDIT_AUTHOR = gql`
  mutation editAuthor ($name: String!, $born: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $born
    ) {
      name
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  const [createBook] = useMutation(CREATE_BOOK, {refetchQueries: [ { query: ALL_BOOKS }, { query: ALL_AUTHORS } ]})
  const [editAuthor] = useMutation(EDIT_AUTHOR, {refetchQueries: [ { query: ALL_AUTHORS } ]})

  if ( authors.loading || books.loading ) {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} authors={authors.data.allAuthors} editAuthor={editAuthor} />

      <Books show={page === 'books'} books={books.data.allBooks} />

      <NewBook show={page === 'add'} createBook={createBook} />
    </div>
  )
}

export default App
