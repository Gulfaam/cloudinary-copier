import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const maxDuration = 300; // 5 minutes max duration for serverless in Vercel, ignored in local but good to have

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sourceCloudName,
      sourceApiKey,
      sourceApiSecret,
      targetCloudName,
      targetApiKey,
      targetApiSecret,
      folderPath,
    } = body;

    // Validate inputs
    if (!sourceCloudName || !sourceApiKey || !sourceApiSecret || !targetCloudName || !targetApiKey || !targetApiSecret || !folderPath) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Since Cloudinary SDK uses global config, we'll fetch assets using the source credentials
    cloudinary.config({
      cloud_name: sourceCloudName,
      api_key: sourceApiKey,
      api_secret: sourceApiSecret,
      secure: true,
    });

    // 1. Fetch assets from Source Account
    let allResources: any[] = [];
    let nextCursor = null;

    // Remove trailing slashes and Cloudinary dashboard UI path prefixes
    let cleanFolder = folderPath.trim().replace(/\/$/, "");
    cleanFolder = cleanFolder.replace(/^.*media_library\/folders\//, "");
    
    const searchExp = `folder:"${cleanFolder}" OR folder:"${cleanFolder}/*"`;

    do {
      const searchRequest = cloudinary.search
        .expression(searchExp)
        .sort_by('public_id', 'asc')
        .max_results(500);

      if (nextCursor) {
        searchRequest.next_cursor(nextCursor);
      }

      const result = await searchRequest.execute();
      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    if (allResources.length === 0) {
      return NextResponse.json({ error: 'No resources found in the specified source folder.' }, { status: 404 });
    }

    // 2. Configure for Target Account
    cloudinary.config({
      cloud_name: targetCloudName,
      api_key: targetApiKey,
      api_secret: targetApiSecret,
      secure: true,
    });

    // 3. Upload to Target Account
    let transferredCount = 0;
    
    // Process in batches of 10 to avoid overwhelming the network/API
    const BATCH_SIZE = 10;
    for (let i = 0; i < allResources.length; i += BATCH_SIZE) {
      const batch = allResources.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (resource) => {
        try {
          let targetPublicId = resource.public_id;
          
          // Enforce generating the exact folder hierarchy using the 'public_id' slash notation (Fixed Folders mode)
          // This guarantees the folder visually appears in Media Library -> Home -> <cleanFolder>
          if (!targetPublicId.startsWith(cleanFolder)) {
             // If public_id was completely separated from the folder (Asset Folders mode)
             targetPublicId = `${cleanFolder}/${targetPublicId}`;
          }

          const uploadOptions: Record<string, any> = {
            public_id: targetPublicId,
            resource_type: resource.resource_type || 'auto',
            overwrite: true,
          };
          
          // Also set the modern asset_folder property just in case their account exclusively uses it
          uploadOptions.asset_folder = cleanFolder;

          // Cloudinary secure_url can be directly uploaded
          await cloudinary.uploader.upload(resource.secure_url, uploadOptions);
          transferredCount++;
        } catch (uploadError: any) {
          console.error(`Failed to upload ${resource.public_id}:`, uploadError.message);
          // depending on needs, you might want to continue or throw
        }
      }));
    }

    return NextResponse.json({ success: true, transferredCount });
  } catch (error: any) {
    console.error('Transfer API Error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during transfer.' }, { status: 500 });
  }
}
