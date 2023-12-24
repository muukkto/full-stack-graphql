import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN, USER } from '../queries'

const LoginForm = ({ show, setError, setLoginToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }})

  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      setLoginToken(token)
      localStorage.setItem('service-user-token', token)
    }
  }, [result.data])

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
  }

  return (
    <div>
    <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm