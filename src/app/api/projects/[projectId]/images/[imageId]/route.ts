// Template routes: Single image within a project (read, update, delete)

export async function GET(_request: Request, context: { params: { projectId: string; imageId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize access to the project
  // TODO: Load image by imageId under projectId from MongoDB
  // TODO: Return image metadata
  return new Response(null);
}

export async function PATCH(request: Request, context: { params: { projectId: string; imageId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize write access to the project
  // TODO: Validate updatable fields (e.g., labels, description)
  // TODO: Update image in MongoDB
  // TODO: Return updated image metadata
  return new Response(null);
}

export async function DELETE(_request: Request, context: { params: { projectId: string; imageId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize delete permission
  // TODO: Delete image from MongoDB and storage if needed
  // TODO: Return success response
  return new Response(null);
}


