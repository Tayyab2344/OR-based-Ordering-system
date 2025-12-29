import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params must be awaited in Next.js 15
) {
    const { id } = await params;
    const order = db.getOrder(id);

    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params must be awaited in Next.js 15
) {
    try {
        const { id } = await params;
        const updates = await request.json();
        const updatedOrder = db.updateOrder(id, updates);

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
