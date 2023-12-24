import { useState } from 'react'

import { useQuery } from '@apollo/client'

import { ALL_BOOKS, USER } from '../queries'

const FavoriteBooks = (props) => {
  let filter = ""
  const user_query = useQuery(USER)

  if (user_query.data){
    if (user_query.data.me)
        filter = user_query.data.me.favoriteGenre
  }

  const books_query = useQuery(ALL_BOOKS, {variables: {genre: filter}})

  if (!props.show) {
    return null
  }

  if ( books_query.loading ) {
    return <div>loading...</div>
  }

  const books = books_query.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>

      <p>books in your favorite genre <b>{filter}</b></p>

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
    </div>
  )
}

export default FavoriteBooks
