import { expect, it, describe, beforeEach } from 'vitest'
import { makeAnswer } from 'test/factories/make-answer'
import { DeleteAnswerUseCase } from './delete-answer'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { NotAllowedError } from './errors/not-allowed-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: DeleteAnswerUseCase

describe('Delete Answer Use Case', () => {
  beforeEach(() => {
    inMemoryAnswersRepository = new InMemoryAnswersRepository()
    sut = new DeleteAnswerUseCase(inMemoryAnswersRepository)
  })

  it('should be able to delete a answer', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('answer-1'),
    )

    await inMemoryAnswersRepository.create(newAnswer)

    await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    })

    expect(inMemoryAnswersRepository.items).toHaveLength(0)
  })

  it('should not be able to delete an answer from another author', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('answer-1'),
    )

    await inMemoryAnswersRepository.create(newAnswer)

    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to delete a answer that does not exist', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('answer-2'),
    )

    await inMemoryAnswersRepository.create(newAnswer)

    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
