import React from 'react'
import { Link, useRouteError } from 'react-router-dom'
function ErrorPage() {
  const error = useRouteError()

  return (
    <div className='h-screen bg-white flex items-center justify-center'>
    <section className='flex flex-col items-center'>
      <h1 className='text-6xl font-bold'>404</h1>
      <h5 className='text-xl font-medium'>page not found</h5>
      <Link to={'..'} relative={'path'} className='capitalize text-center font-medium mt-2 bg-blue-400 p-4 w-40 rounded-full'>go back</Link>
    </section>
    </div>
  )
}

export default ErrorPage
