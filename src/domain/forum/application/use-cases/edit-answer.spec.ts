import { expect, it, describe, beforeEach } from 'vitest'
import { makeAnswer } from 'test/factories/make-answer'
import { EditAnswerUseCase } from './edit-answer'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: EditAnswerUseCase

describe('Edit Answer Use Case', () => {
  beforeEach(() => {
    inMemoryAnswersRepository = new InMemoryAnswersRepository()
    sut = new EditAnswerUseCase(inMemoryAnswersRepository)
  })

  it('should be able to edit a answer', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('answer-1'),
    )

    await inMemoryAnswersRepository.create(newAnswer)

    await sut.execute({
      authorId: 'author-1',
      answerId: 'answer-1',
      content: 'Updated content',
    })

    expect(inMemoryAnswersRepository.items[0]).toMatchObject({
      content: 'Updated content',
    })
  })

  it('should not be able to edit a answer from another author', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('answer-1'),
    )

    await inMemoryAnswersRepository.create(newAnswer)

    await expect(() =>
      sut.execute({
        authorId: 'author-2',
        answerId: 'answer-1',
        content: 'Updated content',
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should not be able to edit a answer that does not exist', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author-1') },
      new UniqueEntityID('answer-2'),
    )

    await inMemoryAnswersRepository.create(newAnswer)

    await expect(() =>
      sut.execute({
        authorId: 'author-1',
        answerId: 'answer-1',
        content: 'Updated content',
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
