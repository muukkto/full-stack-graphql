import { useState } from 'react'
import Select from 'react-select'

const Authors = (props) => {
  const [born, setBorn] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)

  if (!props.show) {
    return null
  }
  const authors = props.authors

  const options = props.authors.map((a) => ({ 'value': a.name, 'label': a.name}))


  const submit = async (event) => {
    event.preventDefault()

    const born_int = parseInt(born)
    const name = selectedOption.value

    props.editAuthor({ variables: { name, born: born_int }})

    setSelectedOption(null)
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            defaultValue={selectedOption}
            onChange={setSelectedOption}
            options={options}
          />
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
