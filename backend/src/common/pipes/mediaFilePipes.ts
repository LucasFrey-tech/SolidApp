import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  readonly maxSize: number = 10 * 1024 * 1024;
  readonly allowedTypes: RegExp = /\.(jpg|jpeg|png|svg)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new Error('File is required');
    }

    if (value.size > this.maxSize) {
      throw new Error(`File size exceeds maximum of ${this.maxSize} bytes`);
    }

    if (!this.allowedTypes.test(value.originalname)) {
      throw new Error('Only jpg, jpeg, svg and png files are allowed');
    }

    return value;
  }
}

@Injectable()
export class NullableImageValidationPipe implements PipeTransform {
  readonly maxSize: number = 10 * 1024 * 1024;
  readonly allowedTypes: RegExp = /\.(jpg|jpeg|png|svg)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.size > this.maxSize) {
      throw new Error(`File size exceeds maximum of ${this.maxSize} bytes`);
    }

    if (!this.allowedTypes.test(value.originalname)) {
      throw new Error('Only jpg, jpeg, svg and png files are allowed');
    }

    return value;
  }
}

@Injectable()
export class VideoValidationPipe implements PipeTransform {
  readonly maxSize: number = 100000;
  readonly allowedTypes: RegExp = /\.(mp4)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new Error('File is required');
    }

    if (value.size > this.maxSize) {
      throw new Error(`File size exceeds maximum of ${this.maxSize} bytes`);
    }

    if (!this.allowedTypes.test(value.originalname)) {
      throw new Error('Only MP4 files are allowed');
    }

    return value;
  }
}

@Injectable()
export class NullableVideoValidationPipe implements PipeTransform {
  readonly maxSize: number = 100000;
  readonly allowedTypes: RegExp = /\.(mp4)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new Error('File is required');
    }

    if (value.size > this.maxSize) {
      throw new Error(`File size exceeds maximum of ${this.maxSize} bytes`);
    }

    if (!this.allowedTypes.test(value.originalname)) {
      throw new Error('Only MP4 files are allowed');
    }

    return value;
  }
}

@Injectable()
export class PdfValidationPipe implements PipeTransform {
  readonly maxSize: number = 1000;
  readonly allowedTypes: RegExp = /\.(pdf)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new Error('File is required');
    }

    if (value.size > this.maxSize) {
      throw new Error(`File size exceeds maximum of ${this.maxSize} bytes`);
    }

    if (!this.allowedTypes.test(value.originalname)) {
      throw new Error('Only MP4 files are allowed');
    }

    return value;
  }
}

@Injectable()
export class NullablePdfValidationPipe implements PipeTransform {
  readonly maxSize: number = 1000;
  readonly allowedTypes: RegExp = /\.(pdf)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new Error('File is required');
    }

    if (value.size > this.maxSize) {
      throw new Error(`File size exceeds maximum of ${this.maxSize} bytes`);
    }

    if (!this.allowedTypes.test(value.originalname)) {
      throw new Error('Only MP4 files are allowed');
    }

    return value;
  }
}

@Injectable()
export class ImagesArrayValidationPipe implements PipeTransform {
  readonly maxSize: number = 10 * 1024 * 1024;
  readonly allowedTypes: RegExp = /\.(jpg|jpeg|png|svg)$/;

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return [];
    }

    if (!value || !Array.isArray(value) || value.length === 0) {
      throw new BadRequestException('Files are required');
    }

    for (const file of value) {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      if (file.size > this.maxSize) {
        throw new BadRequestException(
          `File size exceeds maximum of ${this.maxSize} bytes`,
        );
      }

      if (!this.allowedTypes.test(file.originalname)) {
        throw new BadRequestException(
          'Only jpg, jpeg, svg and png files are allowed',
        );
      }
    }

    return value;
  }
}
