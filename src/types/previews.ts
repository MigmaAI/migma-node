export type PreviewDeviceStatus = 'PROCESSING' | 'SUCCESSFUL' | 'FAILED';
export type PreviewDeviceCategory = 'DESKTOP' | 'MOBILE' | 'WEB' | 'MISC';
export type PreviewStatus =
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL_SUCCESS'
  | 'FAILED';

export interface PreviewDevice {
  deviceKey: string;
  deviceName: string;
  client: string;
  os: string;
  category: string;
  status: PreviewDeviceStatus;
  screenshotUrl: string | null;
  thumbnailUrl: string | null;
  fullThumbnailUrl: string | null;
  processingTime?: number | null;
}

export interface PreviewMetadata {
  requestedDevices: number;
  completedDevices: number;
  failedDevices: number;
  processingDevices: number;
  processingTime?: number;
}

export interface CreatePreviewParams {
  html: string;
  subject?: string;
  devices?: string[];
  name?: string;
}

export interface CreatePreviewResponse {
  previewId: string;
  status: PreviewStatus;
  devices?: PreviewDevice[];
  metadata: PreviewMetadata;
  cached?: boolean;
}

export interface GetPreviewResponse {
  previewId: string;
  status: PreviewStatus;
  devices: PreviewDevice[];
  metadata: PreviewMetadata;
}

export interface GetPreviewStatusResponse {
  previewId: string;
  status: PreviewStatus;
  metadata: PreviewMetadata;
}

export interface GetDevicePreviewResponse {
  device: PreviewDevice;
}

export interface SupportedDevice {
  key: string;
  name: string;
  category: PreviewDeviceCategory;
}

export interface DeviceCategoriesResponse {
  desktop: SupportedDevice[];
  mobile: SupportedDevice[];
  web: SupportedDevice[];
  misc: SupportedDevice[];
}

export interface GetSupportedDevicesResponse {
  total: number;
  categories: DeviceCategoriesResponse;
  devices: SupportedDevice[];
}
