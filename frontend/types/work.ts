export interface WorkImage {
  url: string;
  publicId: string;
  _id: string;
}

export interface Work {
  _id: string;
  task: {
    _id: string;
    title: string;
  };
  title: string;
  description?: string;
  timeRange?: string;
  images: WorkImage[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    display_image?: string; 
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkData {
  title: string;
  description?: string;
  timeRange?: string;
  images?: File[];
}

export interface UpdateWorkData extends Partial<CreateWorkData> {
  removeImagePublicIds?: string[];
}