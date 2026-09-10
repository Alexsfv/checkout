import { describe, expect, it } from 'vitest';
import { AppError } from './errors';
import { describeError, fieldErrors } from './messages';

describe('describeError', () => {
  it('переводит код API в понятный текст', () => {
    const view = describeError(
      new AppError({ kind: 'http', status: 409, code: 'CART_VERSION_CONFLICT', message: 'x' }),
    );
    expect(view.title).toBe('Корзина изменилась');
    expect(view.retriable).toBe(true);
  });

  it('сетевой сбой предлагает повтор', () => {
    expect(describeError(new AppError({ kind: 'network', message: 'x' })).retriable).toBe(true);
  });

  it('4xx без известного кода повторять не предлагает', () => {
    const view = describeError(new AppError({ kind: 'http', status: 422, message: 'x' }));
    expect(view.retriable).toBe(false);
  });

  it('5xx повторить можно', () => {
    expect(describeError(new AppError({ kind: 'http', status: 503, message: 'x' })).retriable).toBe(
      true,
    );
  });

  it('отмену запроса не показываем как сбой, который стоит повторять', () => {
    expect(describeError(new AppError({ kind: 'aborted', message: 'x' })).retriable).toBe(false);
  });
});

describe('fieldErrors', () => {
  const error = new AppError({
    kind: 'http',
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'x',
    fields: [
      { path: 'body/customer/email', message: 'must match format "email"' },
      { path: 'body/customer/phone', message: 'must match pattern "^\\+[1-9]"' },
      { path: 'body/delivery/address/city', message: 'must NOT have fewer than 2 characters' },
    ],
  });

  it('берёт последний сегмент пути как имя поля', () => {
    const result = fieldErrors(error);
    expect(Object.keys(result)).toEqual(['email', 'phone', 'city']);
    expect(result.email).toBe('Укажите адрес в формате name@example.com');
    expect(result.phone).toBe('Неверный формат');
    expect(result.city).toBe('Слишком короткое значение');
  });

  it('учитывает явное соответствие путей', () => {
    expect(fieldErrors(error, { 'body/customer/email': 'contactEmail' })).toHaveProperty(
      'contactEmail',
    );
  });

  it('на ошибке без полей возвращает пустой объект', () => {
    expect(fieldErrors(new AppError({ kind: 'network', message: 'x' }))).toEqual({});
  });
});
