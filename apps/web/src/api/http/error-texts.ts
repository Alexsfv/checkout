import type { ErrorKind, ErrorText, ErrorView } from './types';

export const ERROR_TEXT_BY_CODE: Record<string, ErrorText> = {
  SESSION_REQUIRED: {
    title: 'Сессия не найдена',
    description: 'Обновите страницу, чтобы начать заново.',
  },
  SESSION_INVALID: {
    title: 'Сессия устарела',
    description: 'Мы создадим новую — обновите страницу.',
  },
  PRODUCT_NOT_FOUND: { title: 'Товар не найден', description: 'Обновите каталог.' },
  INSUFFICIENT_STOCK: { title: 'Не хватает остатка', description: 'Уменьшите количество товара.' },
  CART_EMPTY: { title: 'Корзина пуста', description: 'Добавьте товары, чтобы оформить заказ.' },
  CART_VERSION_CONFLICT: {
    title: 'Корзина изменилась',
    description: 'Мы обновили данные — проверьте состав и продолжите оформление.',
    retriable: true,
  },
  QUOTE_EXPIRED: {
    title: 'Расчёт устарел',
    description: 'Пересчитали доставку заново — проверьте сумму и подтвердите заказ.',
    retriable: true,
  },
  QUOTE_UPDATED: {
    title: 'Сумма заказа изменилась',
    description: 'Проверьте новый итог и подтвердите заказ ещё раз.',
    retriable: true,
  },
  QUOTE_NOT_FOUND: {
    title: 'Расчёт не найден',
    description: 'Пересчитайте доставку.',
    retriable: true,
  },
  ORDER_NOT_FOUND: {
    title: 'Заказ не найден',
    description: 'Возможно, была создана новая сессия.',
  },
  ORDER_ALREADY_PAID: { title: 'Заказ уже оплачен', description: 'Обновите страницу заказа.' },
  PAYMENT_NOT_REQUIRED: {
    title: 'Онлайн-оплата не нужна',
    description: 'Этот заказ оплачивается при получении.',
  },
  PAYMENT_IN_PROGRESS: {
    title: 'Оплата уже идёт',
    description: 'Дождитесь результата текущей попытки.',
  },
  PAYMENT_FINALIZED: {
    title: 'Попытка оплаты уже завершена',
    description: 'Создайте новую попытку, чтобы оплатить заказ.',
  },
  PAYMENT_NOT_FOUND: { title: 'Попытка оплаты не найдена' },
  IDEMPOTENCY_CONFLICT: {
    title: 'Данные запроса изменились',
    description: 'Повторите действие — мы отправим его с новым ключом.',
    retriable: true,
  },
  VALIDATION_ERROR: { title: 'Проверьте заполненные поля' },
  ROUTE_NOT_FOUND: { title: 'Ресурс не найден' },
  INTERNAL_ERROR: { title: 'Сервер не смог обработать запрос', retriable: true },
};

export const ERROR_TEXT_BY_KIND: Record<ErrorKind, ErrorView> = {
  network: {
    title: 'Нет связи с сервером',
    description: 'Проверьте, запущен ли API, и повторите действие.',
    retriable: true,
  },
  timeout: {
    title: 'Сервер не ответил вовремя',
    description: 'Попробуйте ещё раз.',
    retriable: true,
  },
  aborted: { title: 'Запрос отменён', retriable: false },
  http: { title: 'Запрос не выполнен', retriable: true },
  parse: { title: 'Неожиданный ответ сервера', retriable: true },
};

export const UNKNOWN_ERROR_TITLE = 'Что-то пошло не так';

export const FIELD_ISSUE_TEXTS: ReadonlyArray<readonly [string, string]> = [
  ['format "email"', 'Укажите адрес в формате name@example.com'],
  ['pattern', 'Неверный формат'],
  ['must NOT have fewer than', 'Слишком короткое значение'],
  ['must NOT have more than', 'Слишком длинное значение'],
  ['must have required property', 'Заполните поле'],
];

export const FIELD_ISSUE_FALLBACK = 'Проверьте значение';
