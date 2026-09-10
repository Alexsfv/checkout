import { isAppError } from './errors';
import {
  ERROR_TEXT_BY_CODE,
  ERROR_TEXT_BY_KIND,
  FIELD_ISSUE_FALLBACK,
  FIELD_ISSUE_TEXTS,
  UNKNOWN_ERROR_TITLE,
} from './error-texts';
import type { ErrorView } from './types';

export const describeError = (error: unknown): ErrorView => {
  if (!isAppError(error)) {
    return { title: UNKNOWN_ERROR_TITLE, description: String(error), retriable: true };
  }
  const byCode = error.code ? ERROR_TEXT_BY_CODE[error.code] : undefined;
  const fallback = ERROR_TEXT_BY_KIND[error.kind];
  return {
    title: byCode?.title ?? fallback.title,
    description: byCode?.description ?? (byCode ? undefined : fallback.description),
    retriable:
      byCode?.retriable ??
      (error.kind === 'http' ? (error.status ?? 500) >= 500 : fallback.retriable),
    code: error.code,
    requestId: error.requestId,
  };
};

export const fieldErrors = (
  error: unknown,
  map: Record<string, string> = {},
): Record<string, string> => {
  if (!isAppError(error) || !error.fields) return {};
  return error.fields.reduce<Record<string, string>>((acc, issue) => {
    const name = map[issue.path] ?? issue.path.split('/').at(-1);
    if (name && acc[name] === undefined) acc[name] = describeFieldIssue(issue.message);
    return acc;
  }, {});
};

export const describeFieldIssue = (message: string): string => {
  return (
    FIELD_ISSUE_TEXTS.find(([pattern]) => message.includes(pattern))?.[1] ?? FIELD_ISSUE_FALLBACK
  );
};

export const shortMessage = (error: unknown): string => {
  const view = describeError(error);
  return view.description ? `${view.title}. ${view.description}` : view.title;
};
