// Template routes: Single project resource (read, update, delete)

export async function GET(_request: Request, context: { params: { projectId: string } }): Promise<Response> {
  // TODO: Authenticate user
  // TODO: Authorize access to project
  // TODO: Load project by context.params.projectId from MongoDB
  // TODO: Return project
  return new Response(null);
}

export async function PATCH(request: Request, context: { params: { projectId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize (owner or permitted role)
  // TODO: Validate updatable fields
  // TODO: Update project in MongoDB
  // TODO: Return updated project
  return new Response(null);
}

export async function DELETE(_request: Request, context: { params: { projectId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize (owner or admin)
  // TODO: Delete project and cascade/handle related images
  // TODO: Return success response
  return new Response(null);
}


