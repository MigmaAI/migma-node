export interface ProjectImage {
  url: string;
  description?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface AddImageParams {
  url: string;
  description?: string;
  tags?: string[];
}

export interface UpdateImageParams {
  imageUrl: string;
  description?: string;
  tags?: string[];
}

export interface UpdateLogosParams {
  primary?: string | null;
  secondary?: string | null;
  favicon?: string | null;
}

export interface LogosResponse {
  logoUrls: {
    primary?: string;
    secondary?: string;
    favicon?: string;
  };
}
