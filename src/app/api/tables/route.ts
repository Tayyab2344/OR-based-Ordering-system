import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Table } from '@/lib/types';

export async function GET() {
    const tables = db.getTables();
    return NextResponse.json(tables);
}

export async function POST(request: Request) {
    try {
        const tableData: Table = await request.json();
        const newTable = db.addTable(tableData);
        return NextResponse.json(newTable);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
    }
}
