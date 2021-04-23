import React, {useState} from 'react'
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom'

import AuthPage from './pages/Auth'
import BookingsPage from './pages/Bookings'
import EventsPage from './pages/Events'
import MainNavigation from './components/Navigation/MainNavigation'
import AuthContext from './context/auth-context'

import './App.css'

const App = () => {
	const [state, setState] = useState({token: null, userId: null})

	const login = (token, userId) => {
		setState({...state, token, userId})
	}

	const logout = () => {
		setState({...state, token: null, userId: null})
	}
	
	return (
		<BrowserRouter>
			<React.Fragment>
				<AuthContext.Provider
					value={{
						token: state.token,
						userId: state.userId,
						login,
						logout,
					}}>
					<MainNavigation />
					<main className='main-content'>
						<Switch>
							{state.token && <Redirect from='/' to='/events' exact />}
							{state.token && <Redirect from='/auth' to='/events' exact />}
							{!state.token && <Route path='/auth' component={AuthPage} />}
							{state.token && <Route path='/events' component={EventsPage} />}
							{state.token && (
								<Route path='/bookings' component={BookingsPage} />
							)}
							{!state.token && <Redirect to='/auth' exact />}
						</Switch>
					</main>
				</AuthContext.Provider>
			</React.Fragment>
		</BrowserRouter>
	)
}

export default App
