import {applyMiddleware, createStore, compose} from 'redux'
import rootReducer from './rootReducer'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas/index'

const sagaMiddleware = createSagaMiddleware()

const middlewares = applyMiddleware(sagaMiddleware)

const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(rootSaga)

export default store;