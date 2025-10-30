// Template routes: Images collection within a project (list, create)

export async function GET(_request: Request, context: { params: { projectId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize access to the project
  // TODO: Parse query params (pagination, filters)
  // TODO: Load images for the given projectId from MongoDB
  // TODO: Return paginated list of images
  return new Response(null);
}

export async function POST(request: Request, context: { params: { projectId: string } }): Promise<Response> {
  // TODO: Authenticate and authorize write access to the project
  // TODO: Validate request body (image metadata, storage location)
  // TODO: Create image under projectId in MongoDB
  // TODO: Return created image
  return new Response(null);
}


