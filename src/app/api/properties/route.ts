export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchProperties, saveProperty } from '@/lib/db/repository';
import { PropertyFilterParams, PropertyType, PropertyStatus, PropertyAvailability } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: PropertyFilterParams = {
      type: searchParams.get('type') || undefined,
      location: searchParams.get('location') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      status: (searchParams.get('status') as PropertyStatus) || undefined,
      availability: (searchParams.get('availability') as PropertyAvailability) || undefined,
      isPublished: searchParams.get('isPublished') !== null ? searchParams.get('isPublished') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      sort: (searchParams.get('sort') as any) || undefined,
    };

    const properties = await fetchProperties(filters);
    return NextResponse.json({ success: true, properties });
  } catch (error: any) {
    console.error('API Error in GET /api/properties:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.description || !body.property_type || !body.price || !body.location) {
      return NextResponse.json(
        { success: false, error: 'Missing required property fields' },
        { status: 400 }
      );
    }

    const newProperty = await saveProperty({
      title: body.title,
      description: body.description,
      property_type: body.property_type as PropertyType,
      price: Number(body.price),
      location: body.location,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
      area_sqft: body.area_sqft ? Number(body.area_sqft) : null,
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'],
      status: (body.status as PropertyStatus) || 'active',
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      availability: (body.availability as PropertyAvailability) || 'available',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      carpet_area_sqft: body.carpet_area_sqft ? Number(body.carpet_area_sqft) : null,
      facing: body.facing || null,
      furnishing: body.furnishing || null,
    });

    return NextResponse.json({ success: true, property: newProperty }, { status: 201 });
  } catch (error: any) {
    console.error('API Error in POST /api/properties:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
