import { OrderPage } from '@/features/order/OrderPage';

const Page = async ({ params }: { params: Promise<{ orderId: string }> }) => {
  const { orderId } = await params;
  return <OrderPage orderId={orderId} />;
};

export default Page;
