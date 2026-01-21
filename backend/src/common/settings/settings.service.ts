import { Injectable } from '@nestjs/common';

const app_config = require('../../../private/app.config.json');

@Injectable()
export class SettingsService {
    static getHostUrl = (): string => app_config.host.url;
    static getFrontUrl = (): string => app_config.front_url;

    //Media Settings
    static getStaticResourcesPrefix = (): string => app_config.static_resources.images.prefix;
    static getStaticResourcesPath = (): string => app_config.static_resources.images.path;
    static getStaticResourceUrl = (fileName: string): string => {
        return `${SettingsService.getHostUrl()}${SettingsService.getStaticResourcesPrefix()}/${fileName}`;
    }
}