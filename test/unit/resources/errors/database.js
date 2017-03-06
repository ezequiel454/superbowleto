import test from 'ava'
import Sequelize from 'sequelize'
import { identity } from 'ramda'
import { models } from '../../../../src/database'
import { handleDatabaseErrors } from '../../../../src/resources/errors/database'
import {
  DatabaseError,
  InvalidParameterError,
  ValidationError
} from '../../../../src/resources/errors'

const { Queue } = models

test('handleDatabaseErrors: ValidationError', async (t) => {
  const err = await Queue.create({})
    .catch(handleDatabaseErrors)
    .catch(identity)

  const errors = err.errors

  t.true(err instanceof ValidationError, 'is a ValidationError')
  t.true(Array.isArray(errors), 'has an array of errors')
  t.true(errors[0] instanceof InvalidParameterError, 'has an InvalidParameterError')
  t.is(errors[0].message, 'url cannot be null', 'has an error with a `message` property')
  t.is(errors[0].field, 'url', 'has an error with `field = url`')
  t.is(errors[0].type, 'invalid_parameter', 'has an error with `type = invalid_parameter`')
})

test('handleDatabaseErrors: DatabaseError', async (t) => {
  const err = await Promise.resolve()
    .then(() => {
      throw new Sequelize.Error('id should be unique')
    })
    .catch(handleDatabaseErrors)
    .catch(identity)

  t.true(err instanceof DatabaseError, 'is a DatabaseError')
  t.false(err instanceof Sequelize.Error, 'is not a SequelizeError')
  t.is(err.message, 'id should be unique', 'has a `message` property')
  t.is(err.type, 'database', 'has a `type` property')
})
