import React, {useContext, useEffect, useState} from 'react'

import Spinner from '../components/Spinner/Spinner'
import AuthContext from '../context/auth-context'
import BookingList from '../components/Bookings/BookingList/BookingList'
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart'
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls'

const BookingsPage = () => {
	const [state, setState] = useState({
		isLoading: false,
		bookings: [],
		outputType: 'list',
	})

	// static contextType = AuthContext;
	const context = useContext(AuthContext)
	useEffect(() => {
		fetchBookings()
	}, [])

	function fetchBookings() {
		setState({isLoading: true})
		const requestBody = {
			query: `
      query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
               price
             }
            }
          }
          `,
		}

		fetch('http://localhost:8000/graphql', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + context.token,
			},
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!')
				}
				return res.json()
			})
			.then(resData => {
				const bookings = resData.data.bookings
				setState({bookings: bookings, isLoading: false})
			})
			.catch(err => {
				console.log(err)
				setState({isLoading: false})
			})
	}

	const deleteBookingHandler = bookingId => {
		setState({isLoading: true})
		const requestBody = {
			query: `
        mutation CancelBooking($id: ID!) {
            cancelBooking(bookingId: $id) {
            _id
             title
            }
          }
        `,
			variables: {
				id: bookingId,
			},
		}

		fetch('http://localhost:8000/graphql', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + context.token,
			},
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!')
				}
				return res.json()
			})
			.then(resData => {
				setState(prevState => {
					const updatedBookings = prevState.bookings.filter(booking => {
						return booking._id !== bookingId
					})
					return {bookings: updatedBookings, isLoading: false}
				})
			})
			.catch(err => {
				console.log(err)
				setState({isLoading: false})
			})
	}

	const changeOutputTypeHandler = outputType => {
		if (outputType === 'list') {
			setState({outputType: 'list'})
		} else {
			setState({outputType: 'chart'})
		}
	}

	let content = <Spinner />
	if (!state.isLoading) {
		content = (
			<>
				<BookingsControls
					activeOutputType={state.outputType}
					onChange={changeOutputTypeHandler}
				/>
				<div>
					{state.outputType === 'list' ? (
						<BookingList
							bookings={state.bookings}
							onDelete={deleteBookingHandler}
						/>
					) : (
						<BookingsChart bookings={state.bookings} />
					)}
				</div>
			</>
		)
	}
	return <React.Fragment>{content}</React.Fragment>
}

export default BookingsPage
