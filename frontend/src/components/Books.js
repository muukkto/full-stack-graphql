import { useState } from 'react'

import { useQuery } from '@apollo/client'

import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = (props) => {
  const [filter, setFilter] = useState("")

  const books_query = useQuery(ALL_BOOKS, {variables: {genre: filter}})
  const genres_query = useQuery(ALL_GENRES)

  if (!props.show) {
    return null
  }

  if ( books_query.loading || genres_query.loading ) {
    return <div>loading...</div>
  }

  const books = books_query.data.allBooks
  const genres = genres_query.data.allGenres

  return (
    <div>
      <h2>books</h2>

      <p>in genre <b>{filter}</b></p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((g) => (
        <button key={g} onClick={() => setFilter(g)}>{g}</button>
      ))}
      <button key="all" onClick={() => setFilter("")}>all genres</button>
    </div>
  )
}

export default Books
