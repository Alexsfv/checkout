import type { Delivery, PickupPoint } from '@/api/types';
import type { DeliverySummary } from './types';

export const describeDelivery = (
  delivery: Delivery,
  pickupPoints: readonly PickupPoint[] = [],
): DeliverySummary => {
  if (delivery.method === 'pickup') {
    const point = pickupPoints.find((item) => item.id === delivery.pickupPointId);
    return {
      title: 'Самовывоз',
      details: point ? `${point.title}, ${point.address}` : delivery.pickupPointId,
    };
  }
  const { city, street, house, apartment } = delivery.address;
  return {
    title: 'Курьер',
    details: `${city}, ${street}, д. ${house}${apartment ? `, кв. ${apartment}` : ''}`,
  };
};
