import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Button, Row, Col, Card, Form, FormGroup, Input, Label, Container } from 'reactstrap';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';

const socket = io('http://localhost:5050');

const App = () => {
	const history = useHistory();

	const [client_id, set_client_id] = useState(null);
	const [my_games, set_my_games] = useState([]);
	const [my_joined_games, set_my_joined_games] = useState([]);
	const [game_id_input, set_game_id_input] = useState('');
	const [current_game, set_current_game] = useState(null);

	socket.on('connect', () => {
		set_client_id(socket.id);
	});

	const createNewGame = () => {
		socket.emit('create_game', null, (err) => {
			if (err) alert(err);
		});
	};

	socket.on('my_games', (data) => {
		try {
			const parsed_data = JSON.parse(data);
			set_my_games(parsed_data);
		} catch (e) {
			console.log(e);
		}
	});

	const joinGame = (e) => {
		e.preventDefault();

		socket.emit('join_game', game_id_input, (cb) => {
			if (cb && cb.error) alert(cb.error);
			else {
				set_current_game(cb.game_state);
				history.push(`/play/${game_id_input}`);
				set_game_id_input('');
			}
		});
	};

	const joinOwnGame = (game_id) => {
		socket.emit('join_game', game_id, (cb) => {
			if (cb && cb.error) {
				alert(cb.error);
				history.push('/');
			} else {
				set_current_game(cb.game_state);
				history.push(`/play/${game_id}`);
			}
		});
	};

	const startGame = (game_id) => {
		socket.emit('start_game', game_id, (cb) => {
			if (cb && cb.error) {
				alert(cb.error);
			} else {
				set_current_game(cb.game_state);
			}
		});
	};

	const playGame = (game_id, board_index) => {
		socket.emit('play_game', { game_id, board_index }, (cb) => {
			if (cb && cb.error) {
				alert(cb.error);
			} else {
				set_current_game(cb.game_state);
			}
		});
	};

	socket.on('my_current_game', (data) => {
		try {
			const parsed_data = JSON.parse(data);
			set_current_game(parsed_data);
		} catch (e) {
			console.log(e);
		}
	});

	socket.on('my_joined_games', (data) => {
		try {
			const parsed_data = JSON.parse(data);
			set_my_joined_games(parsed_data);
		} catch (e) {
			console.log(e);
		}
	});

	return (
		<div className='App'>
			<Container>
				<h1 className='text-center mt-4'>Multi Player Tic-Tac-Toe</h1>
				<Switch>
					<Route path='/' exact>
						<HomePage
							joinGame={joinGame}
							game_id_input={game_id_input}
							set_game_id_input={set_game_id_input}
							createNewGame={createNewGame}
							my_games={my_games}
							joinOwnGame={joinOwnGame}
						/>
					</Route>
					<Route path='/play/:game_id'>
						<GamePage
							client_id={client_id}
							joinOwnGame={joinOwnGame}
							current_game={current_game}
							startGame={startGame}
							playGame={playGame}
						/>
					</Route>
				</Switch>
			</Container>
		</div>
	);
};

export default App;
