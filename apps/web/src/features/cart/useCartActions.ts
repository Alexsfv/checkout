'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { unwrap } from '@/api/utils';
import { keys } from '@/api/queries';
import type { Cart, Product } from '@/api/types';
import { applyCartItem, withoutCartItem } from './model';

export const useCartActions = () => {
  const queryClient = useQueryClient();

  const optimistic = async (apply: (cart: Cart) => Cart) => {
    await queryClient.cancelQueries({ queryKey: keys.cart });
    const previous = queryClient.getQueryData<Cart>(keys.cart);
    if (previous) queryClient.setQueryData<Cart>(keys.cart, apply(previous));
    return { previous };
  };

  const rollback = (context: { previous?: Cart } | undefined) => {
    if (context?.previous) queryClient.setQueryData(keys.cart, context.previous);
  };

  const settle = () => {
    void queryClient.invalidateQueries({ queryKey: keys.cart });

    void queryClient.invalidateQueries({ queryKey: ['quote'] });
  };

  const setItem = useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      api.setCartItem(input.productId, input.quantity).then(unwrap),
    onMutate: (input) => {
      const product = queryClient
        .getQueryData<Product[]>(keys.products)
        ?.find((item) => item.id === input.productId);
      return optimistic((cart) => applyCartItem(cart, input.productId, input.quantity, product));
    },
    onError: (_error, _input, context) => rollback(context),
    onSettled: settle,
  });

  const removeItem = useMutation({
    mutationFn: (input: { productId: string }) => api.removeCartItem(input.productId).then(unwrap),
    onMutate: (input) => optimistic((cart) => withoutCartItem(cart, input.productId)),
    onError: (_error, _input, context) => rollback(context),
    onSettled: settle,
  });

  return {
    setItem,
    removeItem,

    isBusy: (productId: string) =>
      (setItem.isPending && setItem.variables?.productId === productId) ||
      (removeItem.isPending && removeItem.variables?.productId === productId),
  };
};
