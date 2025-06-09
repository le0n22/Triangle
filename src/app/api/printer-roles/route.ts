
// src/app/api/printer-roles/route.ts
import { NextResponse } from 'next/server';
import { getAllPrinterRoleDefinitionsAction } from '@backend/actions/printerRoleDefinitionActions';
import type { AppPrinterRoleDefinition } from '@/types';

export async function GET() {
  console.log('--- API Route: /api/printer-roles - GET request received ---');
  try {
    const rolesResult = await getAllPrinterRoleDefinitionsAction();

    if ('error' in rolesResult) {
      console.error('--- API Route: /api/printer-roles - Error fetching roles from action:', rolesResult.error);
      return NextResponse.json({ error: `Failed to fetch printer roles: ${rolesResult.error}` }, { status: 500 });
    }
    
    const roles: AppPrinterRoleDefinition[] = rolesResult;
    console.log(`--- API Route: /api/printer-roles - Successfully fetched ${roles.length} roles. ---`);
    return NextResponse.json(roles);

  } catch (error: any) {
    console.error('--- API Route: /api/printer-roles - Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred while fetching printer roles.' }, { status: 500 });
  }
}

// Optional: Add a handler for OPTIONS requests if you encounter CORS issues from Electron in development
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Be more specific in production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
