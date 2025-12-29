import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order } from '@/lib/types';

export async function GET() {
    const orders = db.getOrders();
    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    try {
        const orderData: Order = await request.json();
        const newOrder = db.addOrder(orderData);
        return NextResponse.json(newOrder);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
