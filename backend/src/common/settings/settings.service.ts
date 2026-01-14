import { Injectable } from '@nestjs/common';

const app_config = require('../../../private/app.config.json');

@Injectable()
export class SettingsService {

    //Media Settings
    static getStaticResourcesPath = (): string => app_config.static_resources.images.path;
}