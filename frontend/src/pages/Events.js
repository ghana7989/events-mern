import React, {useContext, useEffect, useState} from 'react'

import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import EventList from '../components/Events/EventList/EventList'
import Spinner from '../components/Spinner/Spinner'
import AuthContext from '../context/auth-context'
import './Events.css'

const EventsPage = () => {
	const [state, setState] = useState({
		creating: false,
		events: [],
		isLoading: false,
		selectedEvent: null,
	})
	let isActive = true

	const context = useContext(AuthContext)
	const titleElRef = React.createRef()
	const priceElRef = React.createRef()
	const dateElRef = React.createRef()
	const descriptionElRef = React.createRef()

	useEffect(() => {
		fetchEvents()
	}, [])

	const startCreateEventHandler = () => {
		setState({creating: true})
	}

	const modalConfirmHandler = () => {
		setState({creating: false})
		const title = titleElRef.current.value
		const price = +priceElRef.current.value
		const date = dateElRef.current.value
		const description = descriptionElRef.current.value

		if (
			title.trim().length === 0 ||
			price <= 0 ||
			date.trim().length === 0 ||
			description.trim().length === 0
		) {
			return
		}

		const event = {title, price, date, description}

		const requestBody = {
			query: `
          mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!) {
            createEvent(eventInput: {title: $title, description: $desc, price: $price, date: $date}) {
              _id
              title
              description
              date
              price
            }
          }
        `,
			variables: {
				...event,
			},
		}

		const token = context.token

		fetch('http://localhost:8000/graphql', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token,
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
					const updatedEvents = [...prevState.events]
					updatedEvents.push({
						_id: resData.data.createEvent._id,
						title: resData.data.createEvent.title,
						description: resData.data.createEvent.description,
						date: resData.data.createEvent.date,
						price: resData.data.createEvent.price,
						creator: {
							_id: context.userId,
						},
					})
					return {events: updatedEvents}
				})
			})
			.catch(err => {
				console.log('err: ', err)
				throw new Error(err.message)
			})
	}

	const modalCancelHandler = () => {
		setState({creating: false, selectedEvent: null})
	}

	function fetchEvents() {
		setState({isLoading: true})
		const requestBody = {
			query: `
      query {
        events {
          _id
          title
              description
              date
              price
              creator {
                _id
                email
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
			},
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!')
				}
				return res.json()
			})
			.then(resData => {
				const events = resData.data.events
				if (isActive) {
					setState({events: events, isLoading: false})
				}
			})
			.catch(err => {
				if (isActive) {
					setState({isLoading: false})
				}
				console.log('err: ', err)
				throw new Error(err.message)
			})
	}

	const showDetailHandler = eventId => {
		setState(prevState => {
			const selectedEvent = prevState.events.find(e => e._id === eventId)
			return {selectedEvent: selectedEvent}
		})
	}

	const bookEventHandler = () => {
		if (!context.token) {
			setState({selectedEvent: null})
			return
		}

		const requestBody = {
			query: `
          mutation BookEvent($id: ID!) {
            bookEvent(eventId: $id) {
              _id
             createdAt
             updatedAt
            }
          }
        `,
			variables: {
				id: state.selectedEvent._id,
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
				setState({selectedEvent: null})
			})
			.catch(err => {})
	}

	useEffect(() => {
		return () => (isActive = false)
	}, [])
	// isActive = false;

	return (
		<React.Fragment>
			{(state.creating || state.selectedEvent) && <Backdrop />}
			{state.creating && (
				<Modal
					title='Add Event'
					canCancel
					canConfirm
					onCancel={modalCancelHandler}
					onConfirm={modalConfirmHandler}
					confirmText='Confirm'>
					<form>
						<div className='form-control'>
							<label htmlFor='title'>Title</label>
							<input type='text' id='title' ref={titleElRef} />
						</div>
						<div className='form-control'>
							<label htmlFor='price'>Price</label>
							<input type='number' id='price' ref={priceElRef} />
						</div>
						<div className='form-control'>
							<label htmlFor='date'>Date</label>
							<input type='datetime-local' id='date' ref={dateElRef} />
						</div>
						<div className='form-control'>
							<label htmlFor='description'>Description</label>
							<textarea id='description' rows='4' ref={descriptionElRef} />
						</div>
					</form>
				</Modal>
			)}
			{state.selectedEvent && (
				<Modal
					title={state.selectedEvent.title}
					canCancel
					canConfirm
					onCancel={modalCancelHandler}
					onConfirm={bookEventHandler}
					confirmText={context.token ? 'Book' : 'Confirm'}>
					<h1>{state.selectedEvent.title}</h1>
					<h2>
						${state.selectedEvent.price} -{' '}
						{new Date(state.selectedEvent.date).toLocaleDateString()}
					</h2>
					<p>{state.selectedEvent.description}</p>
				</Modal>
			)}
			{context.token && (
				<div className='events-control'>
					<p>Share your own Events!</p>
					<button className='btn' onClick={startCreateEventHandler}>
						Create Event
					</button>
				</div>
			)}
			{state.isLoading ? (
				<Spinner />
			) : (
				<EventList
					events={state.events}
					authUserId={context.userId}
					onViewDetail={showDetailHandler}
				/>
			)}
		</React.Fragment>
	)
}

export default EventsPage
